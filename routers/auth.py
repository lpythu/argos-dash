import secrets

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from auth import attach_oauth, attach_session, check_password, current_user, get_user_by_login
from config import public_url
from database import get_db
from models import User
from sso import authorize_url, exchange_code, fetch_profile, get_provider, link_user, load_providers, oauth_cookie, oauth_payload, pkce_pair

router = APIRouter()


class LoginBody(BaseModel):
    login: str
    password: str


def _origin(request: Request) -> str:
    return public_url() or str(request.base_url).rstrip("/")


def _callback_uri(request: Request, provider_id: str) -> str:
    return f"{_origin(request)}/api/auth/sso/{provider_id}/callback"


def _sso_fail() -> RedirectResponse:
    return RedirectResponse("/login?error=sso", status_code=302)


@router.post("/api/login")
async def login(body: LoginBody, response: Response, db: AsyncSession = Depends(get_db)) -> dict:
    user = await get_user_by_login(db, body.login.strip())
    if user is None or not check_password(body.password, user.password_hash):
        raise HTTPException(401, "invalid login")
    attach_session(response, user.id)
    return {"login": user.login, "name": user.name}


@router.post("/api/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie("dash_session")
    response.delete_cookie("dash_oauth")
    return {"ok": True}


@router.get("/api/me")
async def me(user: User = Depends(current_user)) -> dict:
    return {"login": user.login, "name": user.name}


@router.get("/api/auth/sso")
async def sso_list() -> dict:
    return {"providers": [{"id": item.id, "name": item.name} for item in load_providers()]}


@router.get("/api/auth/sso/{provider_id}")
async def sso_start(provider_id: str, request: Request) -> RedirectResponse:
    provider = get_provider(provider_id)
    if provider is None:
        raise HTTPException(404, "unknown provider")
    state = secrets.token_urlsafe(24)
    verifier, challenge = pkce_pair()
    resp = RedirectResponse(
        authorize_url(provider, redirect_uri=_callback_uri(request, provider_id), state=state, challenge=challenge),
        status_code=302,
    )
    attach_oauth(resp, oauth_cookie({"p": provider_id, "s": state, "v": verifier}))
    return resp


@router.get("/api/auth/sso/{provider_id}/callback")
async def sso_callback(
    provider_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    dash_oauth: str | None = Cookie(default=None),
    code: str = "",
    state: str = "",
    error: str = "",
) -> RedirectResponse:
    if error or not code or not state or not dash_oauth:
        return _sso_fail()
    provider = get_provider(provider_id)
    if provider is None:
        raise HTTPException(404, "unknown provider")
    payload = oauth_payload(dash_oauth)
    if payload is None or payload.get("p") != provider_id or payload.get("s") != state or not payload.get("v"):
        return _sso_fail()
    try:
        token = await exchange_code(
            provider,
            code=code,
            redirect_uri=_callback_uri(request, provider_id),
            verifier=str(payload["v"]),
        )
        login, name = await fetch_profile(provider, token)
        user = await link_user(db, provider, login, name)
        await db.commit()
    except HTTPException:
        return _sso_fail()
    resp = RedirectResponse("/", status_code=302)
    attach_session(resp, user.id)
    resp.delete_cookie("dash_oauth")
    return resp
