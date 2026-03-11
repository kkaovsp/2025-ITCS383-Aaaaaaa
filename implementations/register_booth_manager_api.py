#!/usr/bin/env python3
"""Create one booth manager account by calling the backend register endpoint.

This script uses only Python standard library modules so it can run without
creating a virtual environment.
"""

import argparse
import json
import os
import pathlib
import sqlite3
import sys
import urllib.error
import urllib.request


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Register one BOOTH_MANAGER user through the backend API."
    )
    parser.add_argument("--base-url", default="http://localhost:8000", help="Backend base URL")
    parser.add_argument("--username", default="boothManager", help="Booth manager username")
    parser.add_argument("--password", default="boothManager123", help="Booth manager password")
    parser.add_argument("--name", default="Booth Manager", help="Display name")
    parser.add_argument("--contact-info", default="", help="Contact information")
    return parser.parse_args()


def _read_backend_database_url() -> str | None:
    script_dir = pathlib.Path(__file__).resolve().parent
    env_path = script_dir / "backend" / ".env"
    if not env_path.exists():
        return None

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if not line.startswith("DATABASE_URL="):
            continue
        return line.split("=", 1)[1].strip()

    return None


def _resolve_sqlite_db_path(database_url: str) -> pathlib.Path | None:
    prefix = "sqlite:///"
    if not database_url.startswith(prefix):
        return None

    raw_path = database_url[len(prefix):]
    if not raw_path:
        return None

    env_dir = pathlib.Path(__file__).resolve().parent / "backend"

    if raw_path.startswith("./"):
        return (env_dir / raw_path[2:]).resolve()
    if raw_path.startswith("/"):
        return pathlib.Path(raw_path)
    return (env_dir / raw_path).resolve()


def delete_existing_booth_manager(username: str) -> tuple[bool, str]:
    database_url = _read_backend_database_url() or os.getenv("DATABASE_URL")
    if not database_url:
        return False, "DATABASE_URL not found; skipping pre-delete"

    db_path = _resolve_sqlite_db_path(database_url)
    if not db_path:
        return False, f"DATABASE_URL is not SQLite ({database_url}); skipping pre-delete"

    if not db_path.exists():
        return False, f"SQLite DB not found at {db_path}; skipping pre-delete"

    with sqlite3.connect(str(db_path), timeout=20) as connection:
        connection.execute("PRAGMA foreign_keys=ON")

        row = connection.execute(
            "SELECT id, role FROM users WHERE username = ?",
            (username,),
        ).fetchone()

        if not row:
            return False, "No existing user found"

        user_id, role = row
        if str(role) != "BOOTH_MANAGER":
            return False, f"User '{username}' exists but role is '{role}', not BOOTH_MANAGER"

        connection.execute("DELETE FROM notifications WHERE user_id = ?", (user_id,))
        connection.execute("DELETE FROM merchants WHERE user_id = ?", (user_id,))
        connection.execute("DELETE FROM users WHERE id = ?", (user_id,))
        connection.commit()

    return True, f"Deleted existing BOOTH_MANAGER user '{username}'"


def post_register(base_url: str, payload: dict) -> tuple[int, str]:
    url = f"{base_url.rstrip('/')}/api/auth/register"
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url=url,
        data=data,
        method="POST",
        headers={"Content-Type": "application/json"},
    )

    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8", errors="replace")
            return response.status, body
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        return exc.code, body
    except urllib.error.URLError as exc:
        return 0, f"Cannot connect to backend: {exc}"


def main() -> int:
    args = parse_args()

    deleted, delete_message = delete_existing_booth_manager(args.username)
    print(delete_message)
    if delete_message.endswith("not BOOTH_MANAGER"):
        return 1

    payload = {
        "username": args.username,
        "password": args.password,
        "name": args.name,
        "contact_info": args.contact_info,
        "role": "BOOTH_MANAGER",
    }

    status, body = post_register(args.base_url, payload)

    if status == 201:
        print("Booth manager created successfully")
        print(body)
        return 0

    if status == 400 and "already exists" in body.lower():
        print("Booth manager may already exist")
        print(body)
        return 0

    if status == 0:
        print(body)
        print("Tip: start backend first: cd implementations/backend && uvicorn app.main:app --reload --env-file .env")
        return 1

    print(f"Registration failed with HTTP {status}")
    print(body)
    return 1


if __name__ == "__main__":
    sys.exit(main())
