#!/usr/bin/env python3
"""Create one booth manager account by calling the backend register endpoint.

This script uses only Python standard library modules so it can run without
creating a virtual environment.
"""

import argparse
import json
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
