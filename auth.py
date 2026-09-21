import hashlib
import hmac
import secrets
from uuid import UUID

from fastapi import Cookie, Depends, Header, HTTPException, Response
from itsdangerous import BadSignature, URLSafeTimedSerializer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import ingest_token, public_url, secret_key
from database import get_db
from models import User

SESSION_MAX_AGE = 14 * 24 * 3600
OAUTH_MAX_AGE = 600


def _signer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(secret_key(), salt="argos-dash")


def hash_password(password: str, salt: str = "") -> str:
    used = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), used.encode(), 200_000).hex()
    return f"{used}${digest}"


def check_password(password: str, stored: str | None) -> bool:
    if not stored or "$" not in stored:
        return False
    salt, digest = stored.split("$", 1)
    expect = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 200_000).hex()
    return hmac.compare_digest(expect, digest)


def cookie_secure() -> bool:
    return public_url().startswith("https://")


def session_cookie(user_id: UUID) -> str:
    return _signer().dumps(str(user_id))


def attach_session(response: Response, user_id: UUID) -> None:
    response.set_cookie(
        "dash_session",
        session_cookie(user_id),
        httponly=True,
        samesite="lax",
        max_age=SESSION_MAX_AGE,
        secure=cookie_secure(),
    )


def attach_oauth(response: Response, value: str) -> None:
    response.set_cookie(
        "dash_oauth",
        value,
        httponly=True,
        samesite="lax",
        max_age=OAUTH_MAX_AGE,
        secure=cookie_secure(),
    )


def user_id_from_cookie(value: str) -> UUID:
    try:
        return UUID(_signer().loads(value, max_age=60 * 60 * 24 * 14))
    except (BadSignature, ValueError) as exc:
        raise HTTPException(401, "login required") from exc


async def current_user(
    dash_session: str | None = Cookie(default=None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not dash_session:
        raise HTTPException(401, "login required")
    user = await db.get(User, user_id_from_cookie(dash_session))
    if user is None:
        raise HTTPException(401, "login required")
    return user


def require_ingest(authorization: str = Header(default="")) -> None:
    token = ingest_token()
    if not token:
        raise HTTPException(503, "ingest token is not configured")
    given = authorization.removeprefix("Bearer ").strip()
    if not given or not hmac.compare_digest(given, token):
        raise HTTPException(401, "invalid ingest token")


async def get_user_by_login(db: AsyncSession, login: str) -> User | None:
    result = await db.execute(select(User).where(User.login == login))
    return result.scalar_one_or_none()
