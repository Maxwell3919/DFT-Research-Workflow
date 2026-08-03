from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


DATA = Path(__file__).with_name("data") / "intermat-si-surfaces-20260804.json"


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    record = json.loads(raw)
    rows = record["rows"]
    assert record["source"]["doi"] == "https://doi.org/10.1039/D4DD00031E"
    assert record["source"]["license"] == "CC BY 3.0"
    assert [r["miller"] for r in rows] == ["111", "110", "001"]
    assert [r["work_function_opt_eV"] for r in rows] == [5.00, 5.30, 5.64]
    assert [r["surface_energy_opt_J_m2"] for r in rows] == [1.60, 1.66, 2.22]
    return {
        "fixture_type": "frozen public-data post-processing",
        "snapshot_sha256": hashlib.sha256(raw).hexdigest(),
        "source_doi": record["source"]["doi"],
        "jarvis_id": record["calculation_scope"]["jarvis_id"],
        "method": record["calculation_scope"]["method_label_reported_by_source"],
        "rows": rows,
        "mean_absolute_difference": {
            "work_function_eV": sum(abs(r["work_function_opt_eV"] - r["work_function_experiment_eV"]) for r in rows) / len(rows),
            "surface_energy_J_m2": sum(abs(r["surface_energy_opt_J_m2"] - r["surface_energy_experiment_J_m2"]) for r in rows) / len(rows),
        },
        "evidence_boundary": "The script verifies a frozen transcription and redraws published values. It does not rerun or independently validate InterMat DFT or the cited experiments.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    rows = report["rows"]
    panels = [("Work function", "work_function", "eV", 4.4, 5.9), ("Surface energy", "surface_energy", "J m⁻²", 0.8, 2.5)]
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="title desc">', '<title id="title">Published InterMat silicon surface values</title>', '<desc id="desc">Original paired-dot plot comparing published OptB88vdW and experimental work functions and surface energies for silicon 111, 110, and 001 surfaces.</desc>', '<rect width="1000" height="560" fill="#f8f5ee"/>', '<text x="60" y="43" font-family="sans-serif" font-size="25" font-weight="700" fill="#172a3a">Si surfaces: published DFT and experimental values</text>']
    for pi, (label, key, unit, ymin, ymax) in enumerate(panels):
        ox = 70 + pi * 480
        top, height = 90, 330
        parts += [f'<text x="{ox+190}" y="77" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#263746">{label} ({unit})</text>', f'<line x1="{ox}" y1="{top}" x2="{ox}" y2="{top+height}" stroke="#263746"/>', f'<line x1="{ox}" y1="{top+height}" x2="{ox+380}" y2="{top+height}" stroke="#263746"/>']
        for tick in (ymin, (ymin + ymax) / 2, ymax):
            ty = top + (ymax - tick) / (ymax - ymin) * height
            parts += [f'<line x1="{ox-5}" y1="{ty:.1f}" x2="{ox}" y2="{ty:.1f}" stroke="#263746"/>', f'<text x="{ox-10}" y="{ty+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="12" fill="#52616b">{tick:.2f}</text>']
        for i, row in enumerate(rows):
            x = ox + 75 + i * 115
            calc = row[f"{key}_opt_eV" if key == "work_function" else f"{key}_opt_J_m2"]
            exp = row[f"{key}_experiment_eV" if key == "work_function" else f"{key}_experiment_J_m2"]
            cy = top + (ymax - calc) / (ymax - ymin) * height
            ey = top + (ymax - exp) / (ymax - ymin) * height
            parts += [f'<line x1="{x-12}" y1="{cy:.1f}" x2="{x+12}" y2="{ey:.1f}" stroke="#8a969d" stroke-width="2"/>', f'<circle cx="{x-12}" cy="{cy:.1f}" r="7" fill="#2b6f8c"/>', f'<circle cx="{x+12}" cy="{ey:.1f}" r="7" fill="#d45b45"/>', f'<text x="{x-18}" y="{cy-10:.1f}" text-anchor="end" font-family="sans-serif" font-size="12" fill="#2b6f8c">{calc:.2f}</text>', f'<text x="{x+18}" y="{ey+17:.1f}" font-family="sans-serif" font-size="12" fill="#d45b45">{exp:.2f}</text>', f'<text x="{x}" y="{top+height+27}" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#263746">Si({row["miller"]})</text>']
    parts += ['<circle cx="350" cy="486" r="7" fill="#2b6f8c"/><text x="365" y="492" font-family="sans-serif" font-size="15" fill="#263746">OptB88vdW, InterMat</text>', '<circle cx="575" cy="486" r="7" fill="#d45b45"/><text x="590" y="492" font-family="sans-serif" font-size="15" fill="#263746">experiment cited by InterMat</text>', '<text x="500" y="530" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#4b5964">Original rendering of CC BY 3.0 Table 1 values · DOI 10.1039/D4DD00031E · no DFT rerun</text>', '</svg>']
    target.write_text("".join(parts), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    report = run()
    if args.svg:
        render_svg(report, args.svg)
    print(json.dumps(report, indent=2))
