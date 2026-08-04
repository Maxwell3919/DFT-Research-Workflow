"""Reconstruct a teaching plot from the committed QE 7.5 Silicon bands.x output."""
from __future__ import annotations

import csv
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe"
RAW = DATA / "output/si.bands.dat"
EXPECTED_SHA256 = "4903acde7e33eb79906fbcf72e3ea9f5d19593f65b3946818febf36678b6cc3f"


def parse_bands(path: Path) -> list[tuple[tuple[float, float, float], list[float]]]:
    lines = path.read_text(encoding="utf-8").splitlines()[1:]
    rows = []
    for index in range(0, len(lines), 2):
        k = tuple(float(value) for value in lines[index].split())
        bands = [float(value) for value in lines[index + 1].split()]
        rows.append((k, bands))
    assert len(rows) == 141 and all(len(bands) == 8 for _, bands in rows)
    return rows


def run(svg: Path | None = None, csv_path: Path | None = None) -> dict[str, object]:
    assert hashlib.sha256(RAW.read_bytes()).hexdigest() == EXPECTED_SHA256
    rows = parse_bands(RAW)
    distance = [0.0]
    for (left, _), (right, _) in zip(rows, rows[1:]):
        distance.append(distance[-1] + math.dist(left, right))
    if csv_path:
        with csv_path.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.writer(handle)
            writer.writerow(["distance", "kx", "ky", "kz", *[f"band_{i}" for i in range(1, 9)]])
            for value, (kpoint, bands) in zip(distance, rows): writer.writerow([f"{value:.9f}", *kpoint, *bands])
    if svg:
        width, height, margin = 920, 510, 62
        xmin, xmax, ymin, ymax = 0.0, distance[-1], -7.0, 18.0
        x = lambda value: margin + (width - 2 * margin) * (value - xmin) / (xmax - xmin)
        y = lambda value: height - margin - (height - 2 * margin) * (value - ymin) / (ymax - ymin)
        paths = []
        for band in range(8):
            points = " ".join(f"{x(value):.2f},{y(energies[band]):.2f}" for value, (_, energies) in zip(distance, rows))
            paths.append(f'<polyline fill="none" stroke="#145a8d" stroke-width="1.25" points="{points}"/>')
        svg.write_text("\n".join([f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">', '<title id="title">Silicon QE band-path output</title>', '<desc id="desc">Eight Kohn-Sham bands from the committed Quantum ESPRESSO bands.x output for the COD Silicon teaching structure.</desc>', '<rect width="100%" height="100%" fill="white"/>', f'<line x1="{margin}" y1="{y(0):.2f}" x2="{width-margin}" y2="{y(0):.2f}" stroke="#555" stroke-dasharray="4 3"/>', *paths, f'<text x="{margin}" y="30" font-family="sans-serif" font-size="20">Silicon: QE 7.5 band-path output</text>', f'<text x="{width/2}" y="{height-16}" text-anchor="middle" font-family="sans-serif" font-size="14">cumulative path coordinate</text>', f'<text x="20" y="{height/2}" transform="rotate(-90 20 {height/2})" text-anchor="middle" font-family="sans-serif" font-size="14">eigenvalue (eV)</text>', '</svg>', '']), encoding="utf-8")
    return {"raw_sha256": EXPECTED_SHA256, "kpoints": len(rows), "bands": 8, "distance_end": distance[-1]}


if __name__ == "__main__":
    public = ROOT / "public/media/practical-guides/band-structure/build-reciprocal-path-ledger"
    public.mkdir(parents=True, exist_ok=True)
    print(json.dumps(run(public / "silicon-qe-bands.svg", DATA / "silicon-qe-bands.csv"), indent=2))
