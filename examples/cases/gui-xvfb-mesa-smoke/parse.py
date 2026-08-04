#!/usr/bin/env python3
"""Validate the genuine Xvfb/Mesa output markers and screenshot header."""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path

CASE = Path(__file__).resolve().parent
LOG = CASE / "output/x11-smoke.txt"
PNG = CASE / "figures/xvfb-mesa-window.png"
METADATA = CASE / "output/run-metadata.txt"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("not a PNG with IHDR")
    return struct.unpack(">II", data[16:24])


def payload() -> dict[str, object]:
    metadata = METADATA.read_text(encoding="utf-8")
    if "run_status=BLOCKED docker build failed" in metadata:
        build_stderr = CASE / "output/docker-build.stderr"
        if "failed to resolve source metadata" not in build_stderr.read_text(encoding="utf-8"):
            raise ValueError("blocked status lacks Docker metadata-resolution failure")
        return {
            "case_id": "gui-xvfb-mesa-smoke",
            "execution_status": "blocked",
            "blocker": "Docker Hub Ubuntu image metadata request failed before container execution.",
            "docker_build_stderr_sha256": sha256(build_stderr),
        }
    log = LOG.read_text(encoding="utf-8")
    for marker in ("xdpyinfo=PASS", "software_renderer=PASS llvmpipe", "window_detection=PASS", "screenshot=PASS"):
        if marker not in log:
            raise ValueError(f"missing marker: {marker}")
    width, height = png_size(PNG)
    if (width, height) != (1280, 720):
        raise ValueError(f"unexpected screenshot dimensions: {width} x {height}")
    return {"case_id": "gui-xvfb-mesa-smoke", "execution_status": "passed", "png_sha256": sha256(PNG), "png_width": width, "png_height": height}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-derived", action="store_true")
    args = parser.parse_args()
    record = payload()
    if args.write_derived:
        (CASE / "derived/capture.json").write_text(json.dumps(record, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(record, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
