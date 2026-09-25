import os
from pathlib import Path


def database_url() -> str:
    return os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://argos:argos@127.0.0.1:5432/argos",
    )


def data_root() -> Path:
    return Path(os.environ.get("DASH_DATA", "/data"))


def secret_key() -> str:
    value = os.environ.get("DASH_SECRET", "")
    if len(value.encode()) < 32 or value.strip() == "change-me":
        raise RuntimeError("DASH_SECRET must be a random secret of at least 32 bytes")
    return value


def ingest_token() -> str:
    return os.environ.get("DASH_INGEST_TOKEN", "")


def public_url() -> str:
    return os.environ.get("DASH_PUBLIC_URL", "").rstrip("/")


def skill_url() -> str:
    return os.environ.get("DASH_SKILL_URL", "")


def skill_path() -> Path | None:
    raw = os.environ.get("DASH_SKILL_PATH", "")
    if raw:
        return Path(raw)
    baked = Path(__file__).resolve().parent / "skill.md"
    return baked if baked.is_file() else None


def skill_token() -> str:
    return os.environ.get("DASH_SKILL_TOKEN", "")


def admin_user() -> str:
    return os.environ.get("DASH_ADMIN_USER", "admin")


def admin_password() -> str:
    return os.environ.get("DASH_ADMIN_PASSWORD", "")


def sso_providers_json() -> str:
    return os.environ.get("DASH_SSO_PROVIDERS", "").strip()
