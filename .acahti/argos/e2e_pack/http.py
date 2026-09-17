import json
import time
import urllib.error
import urllib.request
from typing import Any


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise urllib.error.HTTPError(req.full_url, code, msg, headers, fp)


def fetch(
    url: str,
    *,
    method: str = "GET",
    timeout: float = 15,
) -> tuple[int, float, Any]:
    headers = {"User-Agent": "argos/1.0", "Accept": "*/*"}
    req = urllib.request.Request(url, headers=headers, method=method)
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), _NoRedirect)
    started = time.monotonic()
    try:
        with opener.open(req, timeout=timeout) as resp:
            raw = resp.read()
            elapsed = time.monotonic() - started
            ctype = str(resp.headers.get("content-type") or "")
            return resp.status, elapsed, decode(raw, ctype)
    except urllib.error.HTTPError as exc:
        raw = exc.read()
        elapsed = time.monotonic() - started
        ctype = str(exc.headers.get("content-type") or "") if exc.headers else ""
        return exc.code, elapsed, decode(raw, ctype)
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return 0, time.monotonic() - started, str(exc)


def decode(raw: bytes, content_type: str) -> Any:
    text = raw.decode("utf-8", errors="replace")
    if "application/json" in content_type or (text[:1] in "{["):
        try:
            return json.loads(text) if text else {}
        except json.JSONDecodeError:
            return text
    return text
