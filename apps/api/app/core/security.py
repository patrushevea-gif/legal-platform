import base64
import hashlib
import hmac
import json
import secrets
from datetime import UTC, datetime, timedelta

from app.core.config import get_settings


def hash_password(password: str, salt: str | None = None) -> str:
    password_salt = salt or secrets.token_hex(16)
    digest = hashlib.scrypt(
        password.encode("utf-8"),
        salt=password_salt.encode("utf-8"),
        n=2**14,
        r=8,
        p=1,
    )
    return f"{password_salt}${base64.urlsafe_b64encode(digest).decode('utf-8')}"


def verify_password(password: str, password_hash: str) -> bool:
    salt, _ = password_hash.split("$", maxsplit=1)
    candidate = hash_password(password, salt=salt)
    return hmac.compare_digest(candidate, password_hash)


def create_access_token(*, subject: str, role: str) -> str:
    settings = get_settings()
    header = _b64url_encode({"alg": "HS256", "typ": "JWT"})
    payload = _b64url_encode(
        {
            "sub": subject,
            "role": role,
            "exp": int(
                (
                    datetime.now(UTC)
                    + timedelta(minutes=settings.jwt_expiration_minutes)
                ).timestamp()
            ),
        }
    )
    signature = _sign(f"{header}.{payload}", settings.jwt_secret)
    return f"{header}.{payload}.{signature}"


def decode_access_token(token: str) -> dict[str, str | int]:
    settings = get_settings()
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid token format")

    header, payload, signature = parts
    expected_signature = _sign(f"{header}.{payload}", settings.jwt_secret)
    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError("Invalid token signature")

    decoded_payload = json.loads(_b64url_decode(payload))
    expires_at = int(decoded_payload["exp"])
    if datetime.now(UTC).timestamp() > expires_at:
        raise ValueError("Token expired")

    return decoded_payload


def _sign(value: str, secret: str) -> str:
    digest = hmac.new(
        secret.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return base64.urlsafe_b64encode(digest).decode("utf-8").rstrip("=")


def _b64url_encode(value: dict[str, str | int]) -> str:
    raw = json.dumps(value, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64url_decode(value: str) -> str:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}".encode("utf-8")).decode(
        "utf-8"
    )
