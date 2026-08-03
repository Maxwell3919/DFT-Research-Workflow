"""Invented magnetic-candidate comparison; this is not a DFT calculation."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    candidates = [
        {"label": "FM seed 1", "final_order": "FM", "energy_eV_per_formula": -12.10, "net_moment": 4.0, "local_moments": [2.0, 2.0]},
        {"label": "AFM seed 1", "final_order": "AFM", "energy_eV_per_formula": -12.16, "net_moment": 0.0, "local_moments": [2.1, -2.1]},
        {"label": "AFM seed 2", "final_order": "AFM", "energy_eV_per_formula": -12.16, "net_moment": 0.0, "local_moments": [2.1, -2.1]},
        {"label": "nonmagnetic seed", "final_order": "nonmagnetic", "energy_eV_per_formula": -11.92, "net_moment": 0.0, "local_moments": [0.0, 0.0]},
    ]
    lowest = min(candidates, key=lambda row: row["energy_eV_per_formula"])
    return {"fixture": "invented compatible collinear candidates", "candidates": candidates, "identified_lowest_candidate": lowest["final_order"], "energy_lower_than_fm_eV_per_formula": lowest["energy_eV_per_formula"] - candidates[0]["energy_eV_per_formula"], "boundary": "Invented ledger only; no magnetic calculation, convergence test, candidate completeness, or material conclusion."}


def svg(result: dict[str, object]) -> str:
    rows = result["candidates"]
    circles = []
    for index, row in enumerate(rows):
        x = 120 + index * 145
        y = 210 - (row["energy_eV_per_formula"] + 12.20) * 1500
        colour = "#2563eb" if row["final_order"] == "AFM" else "#dc2626" if row["final_order"] == "FM" else "#64748b"
        circles.append(f'<circle cx="{x}" cy="{y:.1f}" r="9" fill="{colour}"/><text x="{x-44}" y="238" font-family="sans-serif" font-size="13" fill="#334155">{row["label"]}</text>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="650" height="280" viewBox="0 0 650 280" role="img" aria-labelledby="title desc"><title id="title">Invented magnetic candidate ledger</title><desc id="desc">An original diagram comparing invented compatible FM, AFM, and nonmagnetic candidate energies and moment patterns.</desc><rect width="650" height="280" fill="white"/><line x1="65" y1="215" x2="610" y2="215" stroke="#334155"/><line x1="65" y1="40" x2="65" y2="215" stroke="#334155"/><text x="72" y="30" font-family="sans-serif" font-size="16" fill="#334155">invented energy per formula unit</text>{''.join(circles)}<text x="76" y="62" font-family="sans-serif" font-size="15" fill="#2563eb">blue: compensated local AFM moments, zero net moment</text><text x="76" y="84" font-family="sans-serif" font-size="15" fill="#334155">lowest listed candidate only; candidate set remains bounded</text></svg>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert result["identified_lowest_candidate"] == "AFM"
    assert result["energy_lower_than_fm_eV_per_formula"] == -0.0600000000000005
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
    print("Invented magnetic-candidate fixture passed; it verifies ledger comparison and SVG rendering only.")


if __name__ == "__main__":
    main()
