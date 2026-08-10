#!/usr/bin/env python3
"""Validate every file-backed manifest against the public JSON Schema."""

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "workflow" / "case-schema.json"
CASES_ROOT = ROOT / "examples" / "cases"


def main() -> int:
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    manifests = sorted(CASES_ROOT.glob("*/manifest.json"))
    if not manifests:
        raise SystemExit("FAIL no file-backed case manifests found")

    failures: list[str] = []
    for path in manifests:
        document = json.loads(path.read_text(encoding="utf-8"))
        for error in sorted(validator.iter_errors(document), key=lambda item: list(item.path)):
            location = ".".join(str(part) for part in error.path) or "<root>"
            failures.append(f"{path.parent.name}:{location}: {error.message}")

    if failures:
        raise SystemExit("FAIL file-backed case schema\n" + "\n".join(failures))
    print(f"File-backed case schema valid: {len(manifests)} manifest(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
