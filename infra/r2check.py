#!/usr/bin/env python3
"""Test R2 S3 credentials directly, bypassing Terraform.

Runs two requests so we can tell "credentials are wrong" apart from
"credentials are fine but not scoped to this bucket":

  1. ListBuckets  (account-level)
  2. ListObjectsV2 on the target bucket

Prints status codes and R2's error body. Never prints the secret.
"""

import datetime
import hashlib
import hmac
import os
import sys
import urllib.error
import urllib.request

ACCOUNT = "e4048fea381881a01fd409e6613d6ac5"
BUCKET = "sonsenim-tfstate"
HOST = f"{ACCOUNT}.r2.cloudflarestorage.com"
REGION = "auto"
SERVICE = "s3"

access_key = os.environ.get("AWS_ACCESS_KEY_ID", "")
secret_key = os.environ.get("AWS_SECRET_ACCESS_KEY", "")

if not access_key or not secret_key:
    sys.exit("AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY not set in this shell")

print(f"access key id: {access_key[:6]}…{access_key[-4:]}  (len {len(access_key)})")
print(f"secret:        <hidden>                (len {len(secret_key)})")
print(f"endpoint:      https://{HOST}\n")


def sign(key, msg):
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()


def request(path, query, label):
    now = datetime.datetime.now(datetime.timezone.utc)
    amzdate = now.strftime("%Y%m%dT%H%M%SZ")
    datestamp = now.strftime("%Y%m%d")
    payload_hash = hashlib.sha256(b"").hexdigest()

    canonical_headers = (
        f"host:{HOST}\n"
        f"x-amz-content-sha256:{payload_hash}\n"
        f"x-amz-date:{amzdate}\n"
    )
    signed_headers = "host;x-amz-content-sha256;x-amz-date"

    canonical_request = "\n".join(
        ["GET", path, query, canonical_headers, signed_headers, payload_hash]
    )

    scope = f"{datestamp}/{REGION}/{SERVICE}/aws4_request"
    string_to_sign = "\n".join(
        [
            "AWS4-HMAC-SHA256",
            amzdate,
            scope,
            hashlib.sha256(canonical_request.encode("utf-8")).hexdigest(),
        ]
    )

    k = sign(f"AWS4{secret_key}".encode("utf-8"), datestamp)
    k = sign(k, REGION)
    k = sign(k, SERVICE)
    k = sign(k, "aws4_request")
    signature = hmac.new(k, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

    authorization = (
        f"AWS4-HMAC-SHA256 Credential={access_key}/{scope}, "
        f"SignedHeaders={signed_headers}, Signature={signature}"
    )

    url = f"https://{HOST}{path}"
    if query:
        url += f"?{query}"

    req = urllib.request.Request(url, method="GET")
    req.add_header("Host", HOST)
    req.add_header("x-amz-date", amzdate)
    req.add_header("x-amz-content-sha256", payload_hash)
    req.add_header("Authorization", authorization)

    print(f"--- {label}")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", "replace")
            print(f"    HTTP {resp.status}")
            print(f"    {body[:500]}\n")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        print(f"    HTTP {e.code}")
        print(f"    {body[:500]}\n")
    except Exception as e:  # noqa: BLE001
        print(f"    request failed: {e}\n")


request("/", "", "ListBuckets (are the credentials valid at all?)")
request(f"/{BUCKET}", "list-type=2&max-keys=1", f"ListObjectsV2 on {BUCKET} (is the token scoped to it?)")
