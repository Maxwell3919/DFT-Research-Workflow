"""Invented anisotropy and exchange ledger; this is not a DFT calculation."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    directional = {"c axis": -20.0000, "a axis": -19.9920, "b axis": -19.9950}
    reference = min(directional, key=directional.get)
    # H = -J e1 dot e2: E_parallel=-J, E_antiparallel=+J.
    parallel, antiparallel = -8.0, 8.0
    fitted_j = (antiparallel - parallel) / 2
    held_out_orthogonal = 0.0
    predicted_orthogonal = 0.0
    return {
        "fixture": "invented fixed-geometry SOC directional and two-site exchange energies",
        "energy_unit": "invented micro-energy units per declared magnetic ion",
        "easy_direction_within_fixture": reference,
        "mae_relative_to_c": {axis: energy - directional["c axis"] for axis, energy in directional.items()},
        "heisenberg_convention": "H = -J e1 dot e2; positive J favours parallel moments",
        "fitted_J": fitted_j,
        "held_out_orthogonal_energy": held_out_orthogonal,
        "predicted_orthogonal_energy": predicted_orthogonal,
        "boundary": "Invented arithmetic only; no SOC calculation, material MAE, exchange parameter, or finite-temperature prediction.",
    }


def svg(result: dict[str, object]) -> str:
    mae = result["mae_relative_to_c"]
    bars = []
    for index, (axis, value) in enumerate(mae.items()):
        x = 125 + index * 160
        height = 18 + float(value) * 12
        bars.append(f'<rect x="{x}" y="{185-height:.1f}" width="78" height="{height:.1f}" fill="#2563eb"/><text x="{x}" y="208" font-family="sans-serif" font-size="14" fill="#334155">{axis}</text><text x="{x}" y="{175-height:.1f}" font-family="sans-serif" font-size="13" fill="#334155">{value:.3f}</text>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="680" height="290" viewBox="0 0 680 290" role="img" aria-labelledby="title desc"><title id="title">Invented anisotropy and exchange ledger</title><desc id="desc">Original diagram of invented directional energy differences and a two-site exchange sign convention.</desc><rect width="680" height="290" fill="white"/><text x="48" y="35" font-family="sans-serif" font-size="18" fill="#0f172a">invented directional differences relative to c axis</text><line x1="72" y1="185" x2="580" y2="185" stroke="#334155"/>{''.join(bars)}<rect x="410" y="72" width="228" height="106" rx="8" fill="#f1f5f9" stroke="#64748b"/><text x="427" y="103" font-family="sans-serif" font-size="15" fill="#0f172a">H = -J e₁·e₂</text><text x="427" y="130" font-family="sans-serif" font-size="14" fill="#334155">parallel: -J</text><text x="427" y="153" font-family="sans-serif" font-size="14" fill="#334155">antiparallel: +J</text><text x="48" y="256" font-family="sans-serif" font-size="14" fill="#334155">invented values; directional ranking and fitted J are conditional model quantities</text></svg>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert result["easy_direction_within_fixture"] == "c axis"
    assert result["mae_relative_to_c"]["a axis"] == 0.007999999999999119
    assert result["fitted_J"] == 8.0
    assert result["held_out_orthogonal_energy"] == result["predicted_orthogonal_energy"]
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
    print("Invented anisotropy/exchange fixture passed; it verifies arithmetic and SVG rendering only.")


if __name__ == "__main__":
    main()
