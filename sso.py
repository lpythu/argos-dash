import base64
import hashlib
import json
import re
import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
from fastapi import HTTPException
from itsdangerous import BadSignature, URLSafeTimedSerializer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import secret_key, sso_providers_json
from models import Identity, User

_ID = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{0,31}$")


@dataclass(frozen=True)
class SSOProvider:
    id: str
    name: str
    client_id: str
    client_secret: str
    authorize_url: str
    token_url: str
    userinfo_url: str
    login_claim: str
    name_claim: str


def _oauth_signer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(secret_key(), salt="argos-dash-oauth")


def oauth_cookie(payload: dict) -> str:
    return _oauth_signer().dumps(payload)


def oauth_payload(value: str) -> dict | None:
    try:
        data = _oauth_signer().loads(value, max_age=600)
    except (BadSignature, TypeError, ValueError):
        return None
    return data if isinstance(data, dict) else None


def pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(48)
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode()
    return verifier, challenge


def load_providers() -> list[SSOProvider]:
    raw = sso_providers_json()
    if not raw:
        return []
    try:
        rows = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise HTTPException(500, "invalid DASH_SSO_PROVIDERS") from exc
    if not isinstance(rows, list):
        raise HTTPException(500, "invalid DASH_SSO_PROVIDERS")
    out: list[SSOProvider] = []
    seen: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            continue
        provider_id = str(row.get("id") or "").strip()
        if not _ID.match(provider_id) or provider_id in seen:
            continue
        authorize = str(row.get("authorize_url") or "").strip()
        token = str(row.get("token_url") or "").strip()
        userinfo = str(row.get("userinfo_url") or "").strip()
        client_id = str(row.get("client_id") or "").strip()
        if not authorize or not token or not userinfo or not client_id:
            continue
        seen.add(provider_id)
        out.append(
            SSOProvider(
                id=provider_id,
                name=str(row.get("name") or provider_id).strip() or provider_id,
                client_id=client_id,
                client_secret=str(row.get("client_secret") or "").strip(),
                authorize_url=authorize,
                token_url=token,
                userinfo_url=userinfo,
                login_claim=str(row.get("login_claim") or "login").strip() or "login",
                name_claim=str(row.get("name_claim") or "name").strip() or "name",
            )
        )
    return out


def get_provider(provider_id: str) -> SSOProvider | None:
    return next((item for item in load_providers() if item.id == provider_id), None)


def authorize_url(provider: SSOProvider, *, redirect_uri: str, state: str, challenge: str) -> str:
    query = urlencode(
        {
            "response_type": "code",
            "client_id": provider.client_id,
            "redirect_uri": redirect_uri,
            "state": state,
            "code_challenge": challenge,
            "code_challenge_method": "S256",
        }
    )
    sep = "&" if "?" in provider.authorize_url else "?"
    return f"{provider.authorize_url}{sep}{query}"


async def exchange_code(provider: SSOProvider, *, code: str, redirect_uri: str, verifier: str) -> str:
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "code_verifier": verifier,
        "client_id": provider.client_id,
    }
    if provider.client_secret:
        data["client_secret"] = provider.client_secret
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(provider.token_url, data=data)
    if resp.status_code != 200:
        raise HTTPException(401, "sso token failed")
    token = (resp.json() if resp.content else {}).get("access_token")
    if not token:
        raise HTTPException(401, "sso token failed")
    return str(token)


async def fetch_profile(provider: SSOProvider, access_token: str) -> tuple[str, str]:
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.get(provider.userinfo_url, headers={"Authorization": f"Bearer {access_token}"})
    if resp.status_code != 200:
        raise HTTPException(401, "sso userinfo failed")
    body = resp.json() if resp.content else {}
    if not isinstance(body, dict):
        raise HTTPException(401, "sso userinfo failed")
    login = str(body.get(provider.login_claim) or "").strip()
    name = str(body.get(provider.name_claim) or login).strip()
    if not login:
        raise HTTPException(401, "sso userinfo missing login")
    return login, name


async def link_user(db: AsyncSession, provider: SSOProvider, subject: str, name: str) -> User:
    found = await db.execute(select(Identity).where(Identity.provider == provider.id, Identity.subject == subject))
    ident = found.scalar_one_or_none()
    if ident is not None:
        user = await db.get(User, ident.user_id)
        if user is None:
            raise HTTPException(401, "sso user missing")
        if name and user.name != name:
            user.name = name
        return user
    user = (await db.execute(select(User).where(User.login == subject))).scalar_one_or_none()
    if user is None:
        user = User(login=subject, name=name or subject, password_hash=None)
        db.add(user)
        await db.flush()
    elif name and user.name != name:
        user.name = name
    db.add(Identity(user_id=user.id, provider=provider.id, subject=subject))
    await db.flush()
    return user
