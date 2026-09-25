from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func, select

from auth import get_user_by_login, hash_password
from config import admin_password, admin_user, data_root, secret_key
from database import Session
from models import User
from routers.auth import router as auth_router
from routers.cli import router as cli_router
from routers.comments import router as comments_router
from routers.runs import router as runs_router
from skill import default_origin, render_skill

UI = Path(__file__).resolve().parent / "ui" / "dist"
REPORT_VIEW = Path(__file__).resolve().parent / "report-view"
INGEST_VERSION = "1"


@asynccontextmanager
async def lifespan(_: FastAPI):
    secret_key()  # Reject unsafe session signing configuration before accepting traffic.
    data_root().mkdir(parents=True, exist_ok=True)
    password = admin_password()
    if password:
        async with Session() as db:
            count = await db.scalar(select(func.count()).select_from(User))
            if not count and await get_user_by_login(db, admin_user()) is None:
                db.add(User(login=admin_user(), name=admin_user(), password_hash=hash_password(password)))
                await db.commit()
    yield


app = FastAPI(title="argos dash", lifespan=lifespan)
app.include_router(auth_router)
app.include_router(cli_router)
app.include_router(runs_router)
app.include_router(comments_router)


@app.get("/health")
async def health() -> dict:
    return {"ok": True, "name": "argos-dash"}


@app.get("/skill.md")
async def skill_md(request: Request) -> Response:
    try:
        body = render_skill(default_origin(str(request.base_url)))
    except FileNotFoundError as exc:
        raise HTTPException(502, str(exc)) from exc
    return Response(
        body,
        media_type="text/markdown; charset=utf-8",
        headers={"Access-Control-Allow-Origin": "*"},
    )


@app.get("/report-view/manifest.json")
async def report_view_manifest() -> dict:
    return {"ingest": INGEST_VERSION}


def _report_asset(name: str, media_type: str) -> FileResponse:
    path = REPORT_VIEW / name
    if not path.is_file():
        raise HTTPException(404, "report view is not built")
    return FileResponse(path, media_type=media_type)


@app.get("/report-view/viewer.js")
async def report_view_js() -> FileResponse:
    return _report_asset("viewer.js", "text/javascript; charset=utf-8")


@app.get("/report-view/viewer.css")
async def report_view_css() -> FileResponse:
    return _report_asset("viewer.css", "text/css; charset=utf-8")


if UI.is_dir():
    app.mount("/assets", StaticFiles(directory=UI / "assets"), name="assets")


@app.get("/{path:path}")
async def spa(path: str) -> FileResponse:
    if not UI.is_dir():
        raise HTTPException(404, "ui is not built")
    candidate = UI / path
    if path and candidate.is_file():
        return FileResponse(candidate)
    return FileResponse(UI / "index.html")
