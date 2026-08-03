from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path


ROWS = [
    {"site": "top", "coverage": 0.25, "cell": "family-A", "energy_eV": -0.72, "relaxed_to": "top"},
    {"site": "bridge", "coverage": 0.25, "cell": "family-A", "energy_eV": -0.83, "relaxed_to": "bridge"},
    {"site": "hollow", "coverage": 0.25, "cell": "family-A", "energy_eV": -0.77, "relaxed_to": "hollow"},
    {"site": "top", "coverage": 0.50, "cell": "family-A", "energy_eV": -0.60, "relaxed_to": "bridge"},
    {"site": "bridge", "coverage": 0.50, "cell": "family-A", "energy_eV": -0.65, "relaxed_to": "bridge"},
    {"site": "hollow", "coverage": 0.50, "cell": "family-A", "energy_eV": -0.58, "relaxed_to": "hollow"},
    {"site": "top", "coverage": 1.00, "cell": "family-A", "energy_eV": -0.45, "relaxed_to": "top"},
    {"site": "bridge", "coverage": 1.00, "cell": "family-A", "energy_eV": -0.40, "relaxed_to": "bridge"},
    {"site": "hollow", "coverage": 1.00, "cell": "family-A", "energy_eV": -0.30, "relaxed_to": "hollow"},
    {"site": "bridge", "coverage": 0.25, "cell": "family-B", "energy_eV": -0.79, "relaxed_to": "bridge"},
]


def run() -> dict[str, object]:
    comparable: dict[tuple[str, float], list[dict[str, object]]] = defaultdict(list)
    for row in ROWS:
        comparable[(row["cell"], row["coverage"])].append(row)

    minima = []
    for (cell, coverage), rows in sorted(comparable.items()):
        if len(rows) < 2:
            continue
        minimum = min(rows, key=lambda row: row["energy_eV"])
        minima.append({"cell": cell, "coverage": coverage, "starting_site": minimum["site"], "final_site": minimum["relaxed_to"], "energy_eV": minimum["energy_eV"]})

    top_half = next(row for row in ROWS if row["site"] == "top" and row["coverage"] == 0.50)
    fixed_coverage = [row for row in ROWS if row["site"] == "bridge" and row["coverage"] == 0.25]
    finite_cell_difference = max(row["energy_eV"] for row in fixed_coverage) - min(row["energy_eV"] for row in fixed_coverage)

    assert top_half["relaxed_to"] != top_half["site"]
    assert minima[0]["starting_site"] == "bridge"
    assert abs(finite_cell_difference - 0.04) < 1e-12

    return {
        "fixture_type": "synthetic adsorption-state comparison grid",
        "rows": ROWS,
        "matched_state_minima": minima,
        "starting_label_change": {"from": top_half["site"], "to": top_half["relaxed_to"], "coverage": top_half["coverage"]},
        "fixed_coverage_cell_difference_eV": finite_cell_difference,
        "evidence_boundary": "The script verifies grouping, relaxed-state relabelling, and finite-cell comparison for invented data. It does not identify a real adsorption site or convergence threshold.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    rows = [row for row in report["rows"] if row["cell"] == "family-A"]
    colors = {"top": "#2b6f8c", "bridge": "#d45b45", "hollow": "#704c8a"}
    x0, y0, width, height = 95, 90, 760, 340
    xmin, xmax, ymin, ymax = 0.2, 1.05, -0.9, -0.2
    sx = lambda value: x0 + (value - xmin) / (xmax - xmin) * width
    sy = lambda value: y0 + (ymax - value) / (ymax - ymin) * height
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="title desc">',
        '<title id="title">Synthetic adsorption site and coverage comparison</title>',
        '<desc id="desc">Conceptual energy curves for top, bridge, and hollow starting sites across three coverages, plus a fixed-coverage finite-cell difference.</desc>',
        '<rect width="1000" height="560" fill="#f8f5ee"/>',
        '<text x="55" y="48" font-family="sans-serif" font-size="26" font-weight="700" fill="#172a3a">Compare only matched adsorption states</text>',
        f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0+height}" stroke="#263746"/>',
        f'<line x1="{x0}" y1="{y0+height}" x2="{x0+width}" y2="{y0+height}" stroke="#263746"/>',
    ]
    for tick in [0.25, 0.50, 1.00]:
        x = sx(tick)
        parts += [f'<line x1="{x:.1f}" y1="{y0+height}" x2="{x:.1f}" y2="{y0+height+6}" stroke="#263746"/>', f'<text x="{x:.1f}" y="{y0+height+27}" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">{tick:.2f}</text>']
    for tick in [-0.8, -0.6, -0.4, -0.2]:
        y = sy(tick)
        parts += [f'<line x1="{x0-6}" y1="{y:.1f}" x2="{x0}" y2="{y:.1f}" stroke="#263746"/>', f'<line x1="{x0}" y1="{y:.1f}" x2="{x0+width}" y2="{y:.1f}" stroke="#d9dfe2"/>', f'<text x="{x0-12}" y="{y+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13" fill="#52616b">{tick:.1f}</text>']
    for index, site in enumerate(["top", "bridge", "hollow"]):
        series = sorted((row for row in rows if row["site"] == site), key=lambda row: row["coverage"])
        points = " ".join(f'{sx(row["coverage"]):.1f},{sy(row["energy_eV"]):.1f}' for row in series)
        parts.append(f'<polyline points="{points}" fill="none" stroke="{colors[site]}" stroke-width="3"/>')
        for row in series:
            parts.append(f'<circle cx="{sx(row["coverage"]):.1f}" cy="{sy(row["energy_eV"]):.1f}" r="7" fill="{colors[site]}"/>')
        parts += [f'<line x1="{880}" y1="{120+index*34}" x2="{910}" y2="{120+index*34}" stroke="{colors[site]}" stroke-width="4"/>', f'<text x="920" y="{126+index*34}" font-family="sans-serif" font-size="15" fill="#263746">{site}</text>']
    parts += [
        '<text x="475" y="478" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#263746">declared site-lattice coverage</text>',
        '<text x="25" y="270" transform="rotate(-90 25 270)" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#263746">E_ads (eV per adsorbate)</text>',
        '<text x="880" y="250" font-family="sans-serif" font-size="14" fill="#52616b">At θ=0.50,</text>',
        '<text x="880" y="272" font-family="sans-serif" font-size="14" fill="#52616b">“top” relaxes</text>',
        '<text x="880" y="294" font-family="sans-serif" font-size="14" fill="#52616b">to bridge.</text>',
        f'<text x="880" y="342" font-family="sans-serif" font-size="14" fill="#52616b">Matched θ=0.25</text>',
        f'<text x="880" y="364" font-family="sans-serif" font-size="14" fill="#52616b">cell spread:</text>',
        f'<text x="880" y="389" font-family="sans-serif" font-size="18" font-weight="700" fill="#a33d2d">{report["fixed_coverage_cell_difference_eV"]:.2f} eV</text>',
        '<text x="500" y="530" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">Synthetic analysis · no material, DFT run, site minimum, or convergence threshold</text>',
        '</svg>',
    ]
    target.write_text("".join(parts), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    if args.svg:
        render_svg(result, args.svg)
    print(json.dumps(result, indent=2))
