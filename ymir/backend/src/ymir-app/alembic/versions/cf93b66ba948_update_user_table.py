"""update user table

Revision ID: cf93b66ba948
Revises: 8d128d880788
Create Date: 2021-12-16 11:13:56.721510

"""
import sqlalchemy as sa

from alembic import context, op

# revision identifiers, used by Alembic.
revision = "cf93b66ba948"
down_revision = "8d128d880788"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "role",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_role_id"), "role", ["id"], unique=False)
    op.create_index(op.f("ix_role_name"), "role", ["name"], unique=False)

    if context.get_x_argument(as_dictionary=True).get("sqlite", None):
        with op.batch_alter_table("user") as batch_op:
            batch_op.add_column(sa.Column("state", sa.Integer(), nullable=True))
            batch_op.add_column(sa.Column("role", sa.Integer(), nullable=True))
            batch_op.add_column(
                sa.Column("last_login_datetime", sa.DateTime(), nullable=True)
            )
            batch_op.create_index(op.f("ix_user_role"), ["role"], unique=False)
            batch_op.create_index(op.f("ix_user_state"), ["state"], unique=False)
            batch_op.drop_column("is_admin")
    else:
        op.add_column("user", sa.Column("state", sa.Integer(), nullable=True))
        op.add_column("user", sa.Column("role", sa.Integer(), nullable=True))
        op.add_column(
            "user", sa.Column("last_login_datetime", sa.DateTime(), nullable=True)
        )
        op.create_index(op.f("ix_user_role"), "user", ["role"], unique=False)
        op.create_index(op.f("ix_user_state"), "user", ["state"], unique=False)
        op.drop_column("user", "is_admin")
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    if context.get_x_argument(as_dictionary=True).get("sqlite", None):
        with op.batch_alter_table("user") as batch_op:
            batch_op.add_column(sa.Column("is_admin", sa.BOOLEAN(), nullable=True))
            batch_op.drop_index(op.f("ix_user_state"))
            batch_op.drop_index(op.f("ix_user_role"))
            batch_op.drop_column("last_login_datetime")
            batch_op.drop_column("role")
            batch_op.drop_column("state")
    else:
        op.add_column("user", sa.Column("is_admin", sa.BOOLEAN(), nullable=True))
        op.drop_index(op.f("ix_user_state"), table_name="user")
        op.drop_index(op.f("ix_user_role"), table_name="user")
        op.drop_column("user", "last_login_datetime")
        op.drop_column("user", "role")
        op.drop_column("user", "state")

    op.drop_index(op.f("ix_role_name"), table_name="role")
    op.drop_index(op.f("ix_role_id"), table_name="role")
    op.drop_table("role")
    # ### end Alembic commands ###