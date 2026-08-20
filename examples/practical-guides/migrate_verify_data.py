"""Compare two sha256sum manifests for byte-for-byte identity.

Accepts two manifest files in sha256sum format (`<hash>  <path>` per
line), compares the path sets and per-file digests, and prints a
per-file PASS/FAIL report followed by a summary. Exit code is 0 when the
manifests agree and 1 when any difference is found.

Teaching boundary: a manifest comparison proves only that the listed
bytes match between the two hosts. It does not prove that the content is
correct, that a calculation succeeded, or that any scientific claim is
valid. Both manifests must be produced with the same relative paths for
the path comparison to be meaningful. This script reads the two manifest
files only; it does not modify files, submit jobs, or access the network.
"""
from __future__ import annotations

import argparse
from pathlib import Path

SHA256_LENGTH = 64


def parse_manifest(path: Path) -> dict[str, str]:
    """Parse sha256sum output into {path: sha256}. Later lines win."""
    entries: dict[str, str] = {}
    for lineno, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = raw.rstrip("\n")
        if not line.strip():
            continue
        parts = line.split()
        if len(parts) < 2:
            raise ValueError(f"{path}:{lineno}: unparsable sha256sum line: {line!r}")
        digest = parts[0]
        if len(digest) != SHA256_LENGTH:
            raise ValueError(f"{path}:{lineno}: expected a {SHA256_LENGTH}-char digest, got {digest!r}")
        name = " ".join(parts[1:])
        entries[name] = digest
    return entries


def compare_manifests(source: dict[str, str], target: dict[str, str]) -> dict[str, list[str]]:
    source_paths = set(source)
    target_paths = set(target)
    common = sorted(source_paths & target_paths)
    missing = sorted(source_paths - target_paths)
    extra = sorted(target_paths - source_paths)
    mismatches = [path for path in common if source[path] != target[path]]
    return {"common": common, "missing": missing, "extra": extra, "mismatches": mismatches}


def print_report(
    source: dict[str, str], target: dict[str, str], result: dict[str, list[str]]
) -> None:
    common, missing, extra, mismatches = (
        result["common"],
        result["missing"],
        result["extra"],
        result["mismatches"],
    )

    for path in common:
        if source[path] == target[path]:
            print(f"===== FILE: {path} =====")
            print(f"PASS: hash matches ({source[path]})")
        else:
            print(f"===== FILE: {path} =====")
            print(f"FAIL: hash mismatch (source {source[path]} vs target {target[path]})")

    for path in missing:
        print(f"===== FILE: {path} =====")
        print("FAIL: missing from target manifest")

    for path in extra:
        print(f"===== FILE: {path} =====")
        print("FAIL: extra, absent from source manifest")

    identical = len(common) - len(mismatches)
    print(
        "Summary: "
        f"{identical} files identical, {len(missing)} missing, "
        f"{len(extra)} extra, {len(mismatches)} hash mismatches."
    )


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    root.add_argument("--source-manifest", type=Path, required=True, metavar="PATH",
                      help="sha256sum manifest produced on the source host")
    root.add_argument("--target-manifest", type=Path, required=True, metavar="PATH",
                      help="sha256sum manifest produced on the target host")
    return root


def main() -> int:
    args = parser().parse_args()
    try:
        source = parse_manifest(args.source_manifest)
        target = parse_manifest(args.target_manifest)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}")
        return 1

    result = compare_manifests(source, target)
    print_report(source, target, result)

    mismatches = result["mismatches"]
    missing = result["missing"]
    extra = result["extra"]
    print(
        "note: byte identity only. This does not prove content correctness, "
        "calculation success, or scientific validity."
    )
    return 0 if not (mismatches or missing or extra) else 1


if __name__ == "__main__":
    raise SystemExit(main())
