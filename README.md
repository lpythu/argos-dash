# argos-dash

Self-hosted run browser for [argos](https://lpythu.github.io/argos/). It does **not** run cases. The CLI (`argospy`) optionally POSTs a local run here and may `GET /report-view` for the local HTML template.

Office: https://argos.s-aidc.com — Helm release `argos`, image `harbor.saidc/platform/argos`.

- Product architecture: https://lpythu.github.io/argos/architecture/
- Ingest (CLI → this service): https://lpythu.github.io/argos/ingest/
- This repo (UI ownership, Postgres, hostPath, Acahti CD, login / SSO): [docs/architecture.md](docs/architecture.md)

Login is local username/password plus optional SSO providers. See architecture Auth.

Git: https://acahti.saidc.ai/saidc/argos-dash — `git push origin dev` deploys office.

Local UI: `./dev` from the repo root, then open http://127.0.0.1:5173 (proxies `/api` to https://argos.s-aidc.com).

## Lists

Browser APIs use the Acahti page envelope. Default page size 20, max 50.

```text
GET /api/runs?page=1&page_size=20
GET /api/catalog?page=1&page_size=20
→ { items, page, page_size, has_more }
```

## Data

Postgres via `DATABASE_URL` (office: `saidc-pg` database `argos`). Run files via `DASH_DATA=/data` on hostPath `/var/lib/saidc/argos`.

## UI development

Use pnpm 11.12.0 (pinned in `ui/package.json`) and Node.js 22.13+.
With Corepack installed, enable its package-manager shims once:

```bash
corepack enable
./dev
```

Run `./dev` from the repo root. It installs dependencies with
`pnpm install --frozen-lockfile` when `ui/node_modules` is missing, then starts Vite.
Open http://127.0.0.1:5173. Vite proxies API requests to
https://argos.s-aidc.com. To use a local backend, run
`DEV_API_TARGET=http://127.0.0.1:8080 ./dev`.

From `ui`, build the dashboard with `pnpm build` and the standalone report viewer with
`pnpm build:report`. Commit `ui/pnpm-lock.yaml` when dependencies change.
