#!/usr/bin/env bash
# Bump dash + chart semver and create an annotated tag X.Y.Z (no v).
# Usage: ./scripts/release.sh 0.6.1
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

VERSION="$1"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version: $VERSION (want X.Y.Z)" >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is not clean. Commit or stash first." >&2
  exit 1
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$BRANCH" != "main" ]]; then
  echo "Must be on main (current: $BRANCH)" >&2
  exit 1
fi

if git rev-parse -q --verify "refs/tags/${VERSION}" >/dev/null; then
  echo "Tag ${VERSION} already exists." >&2
  exit 1
fi

python3 - "$VERSION" <<'PY'
import pathlib, re, sys

version = sys.argv[1]
root = pathlib.Path(".")

def bump(path: pathlib.Path, pattern: str, repl: str) -> None:
    text = path.read_text()
    new, n = re.subn(pattern, repl, text, count=1)
    if n != 1:
        raise SystemExit(f"Failed to update {path}")
    path.write_text(new)

bump(root / "pyproject.toml", r'(?m)^version = "[^"]+"$', f'version = "{version}"')
bump(root / "chart" / "Chart.yaml", r'(?m)^version: .+$', f"version: {version}")
bump(root / "chart" / "Chart.yaml", r'(?m)^appVersion: .+$', f'appVersion: "{version}"')
print(f"bumped dash to {version}")
PY

git add pyproject.toml chart/Chart.yaml
git commit -m "Release ${VERSION}."
git tag -a "${VERSION}" -m "argos-dash ${VERSION}"
echo "Tagged ${VERSION}. Push with: git push origin main --tags"
