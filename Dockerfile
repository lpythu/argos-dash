ARG NODE_IMAGE=node:22-alpine
ARG BASE_IMAGE=python:3.12-slim-bookworm

FROM ${NODE_IMAGE} AS ui
WORKDIR /ui
COPY ui/package.json ui/package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm install
COPY ui/ ./
RUN npm run build

FROM ${BASE_IMAGE}
WORKDIR /app
RUN pip install --no-cache-dir uv
COPY pyproject.toml alembic.ini entrypoint.sh skill.md ./
COPY alembic ./alembic
COPY *.py ./
COPY routers ./routers
RUN --mount=type=cache,target=/root/.cache/uv \
    python -c 'import tomllib, pathlib; print("\n".join(tomllib.load(pathlib.Path("pyproject.toml").open("rb"))["project"]["dependencies"]))' \
    | uv pip install --system -r -
COPY --from=ui /ui/dist ./ui/dist
RUN chmod +x /app/entrypoint.sh
ENV PYTHONPATH=/app
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
