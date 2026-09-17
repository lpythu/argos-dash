# argos-dash

Self-hosted run browser for [argos](https://lpythu.github.io/argos/). It does **not** run cases. The CLI (`argospy`) optionally POSTs a local run here.

Architecture: https://lpythu.github.io/argos/architecture/  
Ingest (CLI → this service): https://lpythu.github.io/argos/ingest/

Office: https://argos.saidc.ai — Helm release `argos`, image `harbor.saidc/platform/argos`.

## Lists

Browser APIs use the Acahti page envelope:

```text
GET /api/runs?page=1&page_size=20
GET /api/catalog?page=1&page_size=20
→ { items, page, page_size, has_more }
```

Default page size 20, max 50.

## ReportView

SPA report page vendors `@argos/report-view` from `ui/src/vendor/report-view` (source of truth: `lpythu/argos` `report-view/`). Copy again after library UI changes.

## Release

Tag `X.Y.Z` (no `v`) on this repo. Chart `appVersion` matches the image tag. Independent from `argospy`.

```bash
./scripts/release.sh 0.6.1
git push origin main --tags
```
