"""sso identities and nullable password

Revision ID: 20260921_0003
Revises: 20260917_0002
Create Date: 2026-09-21
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260921_0003"
down_revision: str | Sequence[str] | None = "20260917_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    bind = op.get_bind()
    cols = {c["name"]: c for c in sa.inspect(bind).get_columns("users")}
    if "password_hash" in cols and not cols["password_hash"].get("nullable", False):
        op.alter_column("users", "password_hash", existing_type=sa.String(256), nullable=True)
    tables = set(sa.inspect(bind).get_table_names())
    if "identities" not in tables:
        op.create_table(
            "identities",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
            sa.Column("provider", sa.String(32), nullable=False),
            sa.Column("subject", sa.String(256), nullable=False),
            sa.UniqueConstraint("provider", "subject"),
        )


def downgrade() -> None:
    raise NotImplementedError("sso identities is not reversible")
