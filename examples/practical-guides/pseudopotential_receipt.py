#!/usr/bin/env python3
"""Validate a pseudopotential receipt without downloading or running DFT.

The default self-test checks the receipt schema.  The ``check`` command can
also bind a receipt to one local file by comparing its filename and SHA-256.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


class ReceiptError(RuntimeError):
    pass


REQUIRED_TEXT = (
    "provider",
    "library_family",
    "library_release",
    "source_url",
    "accessed_at",
    "license",
    "filename",
    "sha256",
    "xc_functional",
    "valence_configuration",
    "relativistic_treatment",
    "pseudopotential_type",
)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_receipt(receipt: object) -> list[str]:
    if not isinstance(receipt, dict):
        raise ReceiptError("receipt must be a JSON object")
    missing = [key for key in REQUIRED_TEXT if not isinstance(receipt.get(key), str) or not receipt[key].strip()]
    if missing:
        raise ReceiptError("missing non-empty text fields: " + ", ".join(missing))
    if not re.fullmatch(r"[0-9a-fA-F]{64}", receipt["sha256"]):
        raise ReceiptError("sha256 must contain exactly 64 hexadecimal characters")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", receipt["accessed_at"]):
        raise ReceiptError("accessed_at must use YYYY-MM-DD")
    if not receipt["source_url"].startswith("https://"):
        raise ReceiptError("source_url must be the exact HTTPS provider URL")
    cutoffs = receipt.get("provider_cutoff_starting_points_ry")
    if not isinstance(cutoffs, dict) or set(cutoffs) != {"ecutwfc", "ecutrho"}:
        raise ReceiptError("provider_cutoff_starting_points_ry must contain ecutwfc and ecutrho")
    for key, value in cutoffs.items():
        if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0):
            raise ReceiptError(f"{key} must be a positive number or null")
    return ["schema", "date", "https-source", "sha256-format", "cutoff-field-shape"]


def report(receipt: dict[str, object], file_path: Path | None) -> dict[str, object]:
    checks = validate_receipt(receipt)
    local_file: dict[str, object] | None = None
    if file_path is not None:
        if not file_path.is_file():
            raise ReceiptError(f"local pseudopotential file does not exist: {file_path}")
        actual_hash = sha256(file_path)
        filename_match = file_path.name == receipt["filename"]
        hash_match = actual_hash.lower() == str(receipt["sha256"]).lower()
        local_file = {
            "path": str(file_path.resolve()),
            "filename_match": filename_match,
            "sha256": actual_hash,
            "sha256_match": hash_match,
        }
        if not filename_match or not hash_match:
            raise ReceiptError("local file does not match the receipt filename and SHA-256")
        checks.extend(["local-filename", "local-sha256"])
    return {
        "status": "PASS",
        "checks": checks,
        "local_file": local_file,
        "boundary": (
            "PASS checks receipt structure and, when supplied, local filename/hash identity. "
            "It does not authenticate the provider, infer missing metadata, test code compatibility, "
            "establish transferability, converge a calculation, or support a scientific claim."
        ),
    }


def self_test() -> dict[str, object]:
    fixture = {
        "provider": "fixture provider",
        "library_family": "fixture family",
        "library_release": "fixture release",
        "source_url": "https://example.invalid/exact-file.UPF",
        "accessed_at": "2026-08-11",
        "license": "fixture only",
        "filename": "exact-file.UPF",
        "sha256": "0" * 64,
        "xc_functional": "fixture XC",
        "valence_configuration": "fixture valence",
        "relativistic_treatment": "fixture relativity",
        "pseudopotential_type": "fixture type",
        "provider_cutoff_starting_points_ry": {"ecutwfc": None, "ecutrho": None},
    }
    result = report(fixture, None)
    result["mode"] = "self-test"
    result["boundary"] = "Schema fixture only; no pseudopotential file or provider was checked."
    return result


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("self-test")
    check = subparsers.add_parser("check")
    check.add_argument("receipt", type=Path)
    check.add_argument("--file", type=Path)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        if args.command in (None, "self-test"):
            result = self_test()
        else:
            receipt = json.loads(args.receipt.read_text(encoding="utf-8"))
            result = report(receipt, args.file)
    except (OSError, json.JSONDecodeError, ReceiptError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error)}, indent=2), file=sys.stderr)
        return 1
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
