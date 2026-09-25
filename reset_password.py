"""Reset an existing local account password without exposing it in argv or logs."""

import argparse
import asyncio
import getpass

from auth import get_user_by_login, hash_password
from database import Session, engine


async def reset_password(login: str, password: str) -> None:
    if len(password) < 16:
        raise ValueError("Use a generated password of at least 16 characters")
    async with Session.begin() as db:
        user = await get_user_by_login(db, login)
        if user is None or user.password_hash is None:
            raise ValueError("Existing local password account not found")
        user.password_hash = hash_password(password)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("login")
    args = parser.parse_args()
    password = getpass.getpass("New password: ")
    if password != getpass.getpass("Confirm password: "):
        parser.exit(1, "Passwords do not match.\n")

    async def run():
        try:
            await reset_password(args.login, password)
        finally:
            await engine.dispose()

    try:
        asyncio.run(run())
    except Exception:
        parser.exit(1, "Password reset failed. Verify the local account, password length and database access.\n")
    print("Password updated. Rotate DASH_SECRET on every replica to revoke existing sessions.")


if __name__ == "__main__":
    main()
