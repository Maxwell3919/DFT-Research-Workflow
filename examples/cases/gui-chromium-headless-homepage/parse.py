#!/usr/bin/env python3
"""Strictly validate the captured PNG header and actual Chromium completion marker."""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path

CASE = Path(__file__).resolve().parent
PNG = CASE / "figures/chromium-headless-walkthrough.png"
STDOUT = CASE / "output/chromium.stdout"
SOURCE = CASE / "source/walkthrough.html"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def png_dimensions(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n" or data[12:16] != b"IHDR":
        raise ValueError("not a PNG with an IHDR chunk")
    return struct.unpack(">II", data[16:24])


def payload() -> dict[str, object]:
    width, height = png_dimensions(PNG)
    if (width, height) != (1280, 720):
        raise ValueError(f"unexpected screenshot dimensions: {width} x {height}")
    if "exit=0\n" not in STDOUT.read_text(encoding="utf-8"):
        raise ValueError("missing Chromium successful exit marker")
    return {
        "case_id": "gui-chromium-headless-homepage",
        "source_sha256": digest(SOURCE),
        "png_sha256": digest(PNG),
        "stdout_sha256": digest(STDOUT),
        "png_width": width,
        "png_height": height,
        "claim_boundary": "Browser headless rendering only; no X11 window, VESTA, structure, DFT, convergence, or scientific claim.",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-derived", action="store_true")
    args = parser.parse_args()
    record = payload()
    if args.write_derived:
        target = CASE / "derived/capture.json"
        target.write_text(json.dumps(record, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(record, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
