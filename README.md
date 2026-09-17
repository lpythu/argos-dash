# argos-dash

Self-hosted run browser for [argos](https://lpythu.github.io/argos/). It does **not** run cases. The CLI (`argospy`) optionally POSTs a local run here and may `GET /report-view` for the local HTML template.

Office: https://argos.saidc.ai — Helm release `argos`, image `harbor.saidc/platform/argos`.

- Product architecture: https://lpythu.github.io/argos/architecture/
- Ingest (CLI → this service): https://lpythu.github.io/argos/ingest/
- This repo (UI ownership, Postgres, hostPath, Acahti CD): [docs/architecture.md](docs/architecture.md)

Git: https://acahti.saidc.ai/saidc/argos-dash — `git push origin dev` deploys office.

## Lists

Browser APIs use the Acahti page envelope. Default page size 20, max 50.

```text
GET /api/runs?page=1&page_size=20
GET /api/catalog?page=1&page_size=20
→ { items, page, page_size, has_more }
```

## Data

Postgres via `DATABASE_URL` (office: `saidc-pg` database `argos`). Run files via `DASH_DATA=/data` on hostPath `/var/lib/saidc/argos`.
