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
  pg["Postgres postgres / argos"]
  disk["container /data"]
  host["office hostPath /var/lib/argos"]
  api --> pg
  api --> disk --> host
```

Run metadata, users, and comments live in Postgres (`DATABASE_URL`). `report.json` and other run files live under `DASH_DATA` (default `/data`), which Helm mounts from the office host path `/var/lib/argos`. Secrets are env from the chart Secret, not files on that volume.

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

## Auth

Local password login stays. Optional SSO is a list of OAuth 2.0 providers (authorization code + PKCE + userinfo). Acahti is one configured provider in office values, not a hard-coded path. OIDC (discovery / `id_token` / JWKS) can be added later per provider; the RP routes and `identities` table stay.

`GET /api/auth/sso` paints buttons. Both paths end in the same `dash_session` cookie (signed user UUID, 14 days). The IdP access token is used once in the callback and is not stored.

```mermaid
flowchart TD
  startNode[open /login]
  startNode --> listSso[GET /api/auth/sso]
  listSso --> page[password form plus SSO buttons]
  page --> choice{how}
  choice -->|submit form| pwd[POST /api/login]
  choice -->|Continue with Acahti| startSso["GET /api/auth/sso/acahti"]
  pwd --> checkPwd{login and password}
  checkPwd -->|no| errPwd[401]
  checkPwd -->|yes| setSess[Set-Cookie dash_session]
  startSso --> idpFlow[IdP code plus PKCE]
  idpFlow --> setSess
  setSess --> home[302 or navigate /]
  home --> me[GET /api/me]
```

### Password

```mermaid
sequenceDiagram
  actor User
  participant UI as Dash_SPA
  participant Dash as argos_dash
  participant DB as Postgres

  User->>UI: /login login password
  UI->>Dash: POST /api/login
  Dash->>DB: SELECT users WHERE login
  alt missing or bad hash
    Dash-->>UI: 401
  else ok
    Dash-->>UI: 200 Set-Cookie dash_session
    UI->>Dash: GET /api/me
    Dash-->>UI: login name
  end
```

1. `POST /api/login` `{login, password}`.
2. Lookup `users`, `check_password`. Failure is 401 for both missing user and bad password.
3. `dash_session` = signed `user.id`, HttpOnly, `samesite=lax`, `secure` when `DASH_PUBLIC_URL` is https.
4. SPA `GET /api/me`. Missing or bad cookie returns to `/login`.

### SSO

`{id}` comes from `DASH_SSO_PROVIDERS`. Office uses `acahti` as the first id.

```mermaid
sequenceDiagram
  actor User
  participant UI as Dash_SPA
  participant Dash as argos_dash
  participant IdP as Acahti
  participant DB as Postgres

  UI->>Dash: GET /api/auth/sso
  Dash-->>UI: providers
  User->>UI: Continue with Acahti
  UI->>Dash: GET /api/auth/sso/acahti
  Dash-->>UI: 302 authorize Set-Cookie dash_oauth
  UI->>IdP: GET /oauth/authorize
  alt no IdP session
    IdP-->>UI: 302 /login?next
    User->>IdP: IdP password
  end
  alt kind web and signed in
    IdP->>IdP: issue code skip consent
  else MCP
    User->>IdP: consent Allow
  end
  IdP-->>UI: 302 callback?code&state
  UI->>Dash: GET /api/auth/sso/acahti/callback
  Dash->>IdP: POST token then GET userinfo
  Dash->>DB: link identities
  Dash-->>UI: 302 / dash_session
```

1. `GET /api/auth/sso` returns `{id, name}` only.
2. Browser goes to `GET /api/auth/sso/{id}` (full navigation).
3. Dash writes `dash_oauth` (state + PKCE verifier) and 302s to `authorize_url`.
4. IdP authenticates the person (Acahti cookie `acahti`, not dash password).
5. First-party `kind=web` skips consent; others show the consent page. Code is one-time and bound to `redirect_uri` + PKCE.
6. Callback checks `state`, exchanges `code` + `code_verifier` on the server, then `GET userinfo_url`.
7. Link: existing `identities(provider, subject)` → that user; else matching `users.login` → attach identity; else JIT user with null `password_hash`.
8. Same `dash_session` as password login. Failures redirect to `/login?error=sso`.

| Ticket | Issuer | Where | Lifetime | Role |
|---|---|---|---|---|
| `dash_oauth` | dash | browser | minutes | PKCE verifier + state |
| IdP `code` | IdP | redirect query | ~5 min, once | exchange token |
| IdP access token | IdP | dash process | callback only | userinfo |
| IdP cookie | IdP | IdP host | IdP policy | skip IdP login next time |
| `dash_session` | dash | dash host | 14d | dash APIs |

### Contract

Env `DASH_SSO_PROVIDERS` is a JSON list. Each item: `id`, `name`, `client_id`, optional `client_secret`, `authorize_url`, `token_url`, `userinfo_url`, `login_claim`, `name_claim`.

| Path | Role |
|---|---|
| `GET /api/auth/sso` | enabled providers |
| `GET /api/auth/sso/{id}` | start PKCE |
| `GET /api/auth/sso/{id}/callback` | token, userinfo, session |
| `POST /api/login` | local password |
| `POST /api/logout` / `GET /api/me` | session |

CLI ingest (`DASH_INGEST_TOKEN`) is unrelated. Adding Google later is another values row (same three URLs).
