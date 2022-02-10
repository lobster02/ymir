"""update task: add error_code

Revision ID: c3c42bab66c6
Revises: eea96681de05
Create Date: 2022-01-26 14:27:33.650462

"""
import sqlalchemy as sa

from alembic import context, op

# revision identifiers, used by Alembic.
revision = "c3c42bab66c6"
down_revision = "eea96681de05"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    if context.get_x_argument(as_dictionary=True).get("sqlite", None):
        with op.batch_alter_table("task") as batch_op:
            batch_op.add_column(
                sa.Column("error_code", sa.String(length=20), nullable=True)
            )
            batch_op.alter_column(
                "name", existing_type=sa.VARCHAR(length=100), nullable=False
            )
            batch_op.alter_column(
                "hash", existing_type=sa.VARCHAR(length=50), nullable=False
            )
    else:
        op.add_column(
            "task", sa.Column("error_code", sa.String(length=20), nullable=True)
        )
        op.alter_column(
            "task", "name", existing_type=sa.VARCHAR(length=100), nullable=False
        )
        op.alter_column(
            "task", "hash", existing_type=sa.VARCHAR(length=50), nullable=False
        )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    if context.get_x_argument(as_dictionary=True).get("sqlite", None):
        with op.batch_alter_table("task") as batch_op:
            batch_op.alter_column(
                "hash", existing_type=sa.VARCHAR(length=50), nullable=True
            )
            batch_op.alter_column(
                "name", existing_type=sa.VARCHAR(length=100), nullable=True
            )
            batch_op.drop_column("error_code")
    else:
        op.alter_column(
            "task", "hash", existing_type=sa.VARCHAR(length=50), nullable=True
        )
        op.alter_column(
            "task", "name", existing_type=sa.VARCHAR(length=100), nullable=True
        )
        op.drop_column("task", "error_code")
    # ### end Alembic commands ###