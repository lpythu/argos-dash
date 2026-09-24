# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:22-bookworm-slim
ARG BASE_IMAGE=python:3.12-slim-bookworm
FROM ${NODE_IMAGE} AS ui
RUN npm install --global pnpm@11.27.1
WORKDIR /ui
COPY ui/package.json ui/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY ui/ ./
RUN pnpm run build && pnpm run build:report

FROM ghcr.io/astral-sh/uv:0.12.0 AS uv
FROM ${BASE_IMAGE}
COPY --from=uv /uv /usr/local/bin/uv
ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH=/opt/venv/bin:$PATH
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project
COPY alembic.ini entrypoint.sh skill.md ./
COPY alembic ./alembic
COPY *.py ./
COPY routers ./routers
COPY --from=ui /ui/dist ./ui/dist
COPY --from=ui /ui/dist-report ./report-view
RUN printf '{"ingest":"1"}\n' > /app/report-view/manifest.json \
    && chmod +x /app/entrypoint.sh \
    && useradd --uid 1000 --create-home app \
    && mkdir -p /data && chown app:app /data
ENV PYTHONPATH=/app
ENV PORT=8080
USER app
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
