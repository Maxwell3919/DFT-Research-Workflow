#!/usr/bin/env python3
"""Create a deterministic public-safe text copy and a hash-bound rule record."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


RULE_VERSION = "public-text-v1"
UPSTREAM_FILE_URL = re.compile(r"(?m)^#\$URL:\s+file:///home/[^\r\n]+\s+\$$")
LOCAL_HOST = re.compile(r"\b[A-Za-z0-9._-]+-MS-[A-Za-z0-9._-]+\b")


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--record", required=True, type=Path)
    parser.add_argument("--kind", required=True, choices=("cod-upstream-path", "local-hostname"))
    args = parser.parse_args()

    raw = args.input.read_bytes()
    text = raw.decode("utf-8")
    if args.kind == "cod-upstream-path":
        public, replacements = UPSTREAM_FILE_URL.subn("#$URL: [upstream repository path removed from public copy] $", text)
        rule = "Replace the COD-exported absolute home-directory repository URL line with a fixed public-copy marker."
    else:
        public, replacements = LOCAL_HOST.subn("[host-withheld]", text)
        rule = "Replace local machine host tokens matching *-MS-* with [host-withheld]."
    if replacements == 0:
        raise SystemExit("FAIL sanitization rule made no replacement")
    public_bytes = public.encode("utf-8")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.record.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_bytes(public_bytes)
    record = {
        "schema_version": "1.0",
        "rule_version": RULE_VERSION,
        "kind": args.kind,
        "rule": rule,
        "replacement_count": replacements,
        "raw_sha256": digest(raw),
        "raw_bytes": len(raw),
        "public_sha256": digest(public_bytes),
        "public_bytes": len(public_bytes),
        "boundary": "The raw file is not committed. This record binds its identity to the deterministic public copy; no scientific content beyond the matched private-path or host token is changed.",
    }
    args.record.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(record, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
