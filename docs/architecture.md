# Architecture

Dash is the hosted run browser for [argos](https://lpythu.github.io/argos/). It does not run cases. Product picture (library vs dash vs packs): https://lpythu.github.io/argos/architecture/

This page is for engineers changing dash UI / report styles.

## Who owns the UI

Source of truth is `ui/src/report-view`. The SPA report page imports it. The same tree builds an IIFE served as public static files. `argospy` downloads those files when a dash URL is configured; it does not vendor React.

```mermaid
flowchart TB
  src["ui/src/report-view"]
  spa["SPA /runs/:id/report"]
  iife["viewer.js + viewer.css"]
  get["GET /report-view"]
  cache["CLI ~/.argos/report-view"]
  src --> spa
  src --> iife --> get --> cache
```

Edit styles here. Do not open the GitHub `argos` library for CSS. There is no `@argos/report-view` npm package.

## Data

```mermaid
flowchart LR
  api["dash API"]
  pg["Postgres saidc-pg / argos"]
  disk["container /data"]
  host["office hostPath /var/lib/saidc/argos"]
  api --> pg
  api --> disk --> host
```

Run metadata, users, and comments live in Postgres (`DATABASE_URL`). `report.json` and other run files live under `DASH_DATA` (default `/data`), which Helm mounts from the office host path `/var/lib/saidc/argos`. Secrets are env from the chart Secret, not files on that volume.

## Ship

Office only. Push `dev` on this Acahti repo.

```mermaid
flowchart LR
  push["git push origin dev"]
  pipe["Acahti cd.office"]
  image["Harbor platform/argos:dev-sha"]
  helm["helm release argos"]
  push --> pipe --> image --> helm
```

Image tag is `dev-{sha}` (and `latest`). No GitHub Actions, no `release.sh` tag.
