ARG NODE_IMAGE=saidc-bj-registry.cn-beijing.cr.aliyuncs.com/base/saidc-node:22-pnpm11.12.0
ARG BASE_IMAGE=saidc-bj-registry.cn-beijing.cr.aliyuncs.com/base/saidc-uv:0.12.0

FROM ${NODE_IMAGE} AS ui
WORKDIR /ui
COPY ui/package.json ui/pnpm-lock.yaml ./
RUN --mount=type=cache,target=/pnpm/store pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY ui/ ./
RUN pnpm run build && pnpm run build:report

FROM ${BASE_IMAGE}
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=secret,id=netrc,target=/root/.netrc \
    --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project
COPY alembic.ini entrypoint.sh skill.md ./
COPY alembic ./alembic
COPY *.py ./
COPY routers ./routers
COPY --from=ui /ui/dist ./ui/dist
COPY --from=ui /ui/dist-report ./report-view
RUN printf '{"ingest":"1"}\n' > /app/report-view/manifest.json \
    && chmod +x /app/entrypoint.sh
ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
