from collections.abc import Callable

from argos.case import ONCE, SOAK, Context, Spec
from argos.runner import CaseFn

from e2e_pack.env import get, name
from e2e_pack.http import fetch

_BAD = {502, 503, 504, 520, 521, 522, 523, 524, 530}


def _probe(path: str, title: str, check) -> Callable[[Context], None]:
    def run(ctx: Context) -> None:
        if name() != "office":
            ctx.skip(f"{title} not on {name()}")
            return
        root = get("ARGOS_DASH_URL")
        if not root:
            ctx.skip("ARGOS_DASH_URL empty")
            return
        url = root + path
        ctx.step("get", "running")
        code, elapsed, body = fetch(url, timeout=15)
        ctx.write("host.json", {"url": url, "code": code, "s": round(elapsed, 3), "body": body})
        ctx.check(code != 0 and code not in _BAD, f"{url} got {code}")
        check(ctx, code, body)
        ctx.metric("host_s", elapsed)
        ctx.step("get", "ok")

    return run


def _health(ctx: Context, code: int, body: object) -> None:
    ctx.check(code == 200, f"health {code}")
    ctx.check(isinstance(body, dict) and body.get("ok") is True, f"health body {body!r}")


def _manifest(ctx: Context, code: int, body: object) -> None:
    ctx.check(code == 200, f"manifest {code}")
    ctx.check(isinstance(body, dict) and str(body.get("ingest") or "") == "1", f"manifest body {body!r}")


def cases() -> list[CaseFn]:
    return [
        CaseFn(
            Spec("host:argos-dash", "dash /health is ok", "host", ("e2e",), (ONCE, SOAK)),
            _probe("/health", "host:argos-dash", _health),
        ),
        CaseFn(
            Spec("host:argos-report-view", "dash /report-view/manifest.json is ingest 1", "host", ("e2e",), (ONCE, SOAK)),
            _probe("/report-view/manifest.json", "host:argos-report-view", _manifest),
        ),
    ]
