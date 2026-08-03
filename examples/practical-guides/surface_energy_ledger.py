from __future__ import annotations

import argparse
import json
from pathlib import Path


FIXTURE = [
    {"layers": 5, "atoms": 20, "area_a2": 31.4, "slab_energy_ev": -102.735},
    {"layers": 7, "atoms": 28, "area_a2": 31.4, "slab_energy_ev": -144.351},
    {"layers": 9, "atoms": 36, "area_a2": 31.4, "slab_energy_ev": -185.959},
    {"layers": 11, "atoms": 44, "area_a2": 31.4, "slab_energy_ev": -227.573},
]
EV_PER_A2_TO_J_PER_M2 = 16.02176634


def linear_fit(xs: list[float], ys: list[float]) -> tuple[float, float]:
    xbar = sum(xs) / len(xs)
    ybar = sum(ys) / len(ys)
    slope = sum((x - xbar) * (y - ybar) for x, y in zip(xs, ys)) / sum(
        (x - xbar) ** 2 for x in xs
    )
    return slope, ybar - slope * xbar


def analyze() -> dict[str, object]:
    atom_counts = [row["atoms"] for row in FIXTURE]
    slab_energies = [row["slab_energy_ev"] for row in FIXTURE]
    fitted_bulk_ev_atom, intercept_ev = linear_fit(atom_counts, slab_energies)
    area = FIXTURE[0]["area_a2"]
    fitted_gamma_ev_a2 = intercept_ev / (2 * area)
    fitted_gamma_j_m2 = fitted_gamma_ev_a2 * EV_PER_A2_TO_J_PER_M2

    mismatched_bulk_ev_atom = fitted_bulk_ev_atom + 0.003
    direct = []
    for row in FIXTURE:
        gamma = (row["slab_energy_ev"] - row["atoms"] * mismatched_bulk_ev_atom) / (
            2 * row["area_a2"]
        )
        direct.append({"layers": row["layers"], "gamma_j_m2": gamma * EV_PER_A2_TO_J_PER_M2})

    assert abs(fitted_bulk_ev_atom - (-5.2014)) < 2e-4
    assert 0.32 < fitted_gamma_j_m2 < 0.38
    assert direct[-1]["gamma_j_m2"] < direct[0]["gamma_j_m2"]
    return {
        "fixture_type": "synthetic slab-energy analysis",
        "slabs": FIXTURE,
        "fit": {
            "bulk_slope_eV_atom": fitted_bulk_ev_atom,
            "two_surface_intercept_eV": intercept_ev,
            "surface_energy_J_m2": fitted_gamma_j_m2,
        },
        "mismatched_reference": {
            "bulk_energy_eV_atom": mismatched_bulk_ev_atom,
            "direct_surface_energies": direct,
        },
        "evidence_boundary": (
            "Invented energies test normalization and thickness-drift diagnostics only; "
            "they are not a DFT run or a material surface energy."
        ),
    }


def render_svg(result: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    values = result["mismatched_reference"]["direct_surface_energies"]
    x0, y0, width, height = 105, 75, 650, 310
    ymin = min(row["gamma_j_m2"] for row in values) - 0.03
    ymax = max(row["gamma_j_m2"] for row in values) + 0.03

    def point(row: dict[str, float]) -> tuple[float, float]:
        x = x0 + (row["layers"] - 5) / 6 * width
        y = y0 + (ymax - row["gamma_j_m2"]) / (ymax - ymin) * height
        return x, y

    pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in map(point, values))
    dots = "".join(
        f'<circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="#d45b45"/>'
        for x, y in map(point, values)
    )
    fit_y = y0 + (ymax - result["fit"]["surface_energy_J_m2"]) / (ymax - ymin) * height
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520" role="img" aria-labelledby="title desc">
<title id="title">Synthetic slab surface-energy ledger</title>
<desc id="desc">Surface energy derived with a deliberately mismatched bulk reference drifts with slab thickness, while a simultaneous linear slab fit gives a stable intercept.</desc>
<rect width="900" height="520" fill="#f7f3ea"/><text x="70" y="42" font-family="sans-serif" font-size="25" font-weight="700" fill="#172a3a">A small bulk-reference mismatch grows with slab thickness</text>
<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0+height}" stroke="#263746"/><line x1="{x0}" y1="{y0+height}" x2="{x0+width}" y2="{y0+height}" stroke="#263746"/>
<line x1="{x0}" y1="{fit_y:.1f}" x2="{x0+width}" y2="{fit_y:.1f}" stroke="#26736f" stroke-width="3" stroke-dasharray="9 7"/>
<polyline points="{pts}" fill="none" stroke="#d45b45" stroke-width="4"/>{dots}
<text x="770" y="{fit_y+6:.1f}" font-family="sans-serif" font-size="16" fill="#26736f">fit intercept</text>
<text x="385" y="435" font-family="sans-serif" font-size="17" fill="#263746">slab layers</text><text x="25" y="260" transform="rotate(-90 25 260)" font-family="sans-serif" font-size="17" fill="#263746">derived γ (J m⁻²)</text>
<text x="105" y="476" font-family="sans-serif" font-size="15" fill="#4b5964">Synthetic fixture: the red trend is a diagnostic failure, not finite-size convergence.</text>
</svg>'''
    target.write_text(svg, encoding="utf-8")


def run() -> dict[str, object]:
    return analyze()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    report = run()
    if args.svg:
        render_svg(report, args.svg)
    print(json.dumps(report, indent=2))
