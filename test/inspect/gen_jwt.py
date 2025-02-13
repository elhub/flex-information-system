#!/usr/bin/env python3
# Generate a JWT token using a private key and decode it using a public key
# Usage: python3 gen_jwt.py <path to private key>
import jwt

from datetime import datetime as dt, timedelta
from datetime import timezone as tz
import sys
import uuid

# Load the private key
with open(sys.argv[1], "r") as f:
    private_key = f.read()

# Define the payload
payload = {
    # Audience
    "aud": "https://test.flex.internal:6443/auth/v0/",
    # Issuer
    "iss": "no:entity:pid:13370000001",  # Test Suite
    # JWT ID
    "jti": str(uuid.uuid4()),
    # Subject (the subject to get a token for)
    "sub": "no:party:gln:1337000000051",  # Test Suite party
    # Issued at
    "iat": dt.now(tz.utc),
    # Expiration time
    "exp": dt.now(tz.utc) + timedelta(seconds=120),  # Token expires in 30 seconds
}

# Create the JWT
token = jwt.encode(payload, private_key, algorithm="RS256")

print(token)
