"""Invented dielectric and Born-charge ledger; this is not a DFPT calculation."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    # Field index first, displacement/force index second; values are invented.
    born_a = [[2.4, 0.0, 0.0], [0.0, 2.1, 0.0], [0.0, 0.0, 2.2]]
    born_b = [[-2.4, 0.0, 0.0], [0.0, -2.1, 0.0], [0.0, 0.0, -2.2]]
    eps_inf = [3.1, 3.3, 3.2]
    eps_ion = [1.4, 0.7, 1.1]
    eps_static = [a + b for a, b in zip(eps_inf, eps_ion)]
    closure = [[born_a[i][j] + born_b[i][j] for j in range(3)] for i in range(3)]
    return {
        "fixture": "invented two-sublattice insulating response tensors",
        "born_index_convention": "first index electric field/polarization, second displacement/force",
        "born_charge_unit": "invented elementary-charge units",
        "born_charge_acoustic_sum": closure,
        "epsilon_infinity_diagonal": eps_inf,
        "epsilon_ion_diagonal": eps_ion,
        "epsilon_zero_diagonal": eps_static,
        "boundary": "Invented tensor arithmetic only; no DFPT, field, polarization, phonon, or material response calculation.",
    }


def svg(result: dict[str, object]) -> str:
    inf = result["epsilon_infinity_diagonal"]
    ion = result["epsilon_ion_diagonal"]
    bars = []
    for i, (a, b) in enumerate(zip(inf, ion)):
        x = 120 + i * 120
        bars.append(f'<rect x="{x}" y="{205-a*28:.1f}" width="38" height="{a*28:.1f}" fill="#2563eb"/><rect x="{x}" y="{205-(a+b)*28:.1f}" width="38" height="{b*28:.1f}" fill="#f97316"/><text x="{x-2}" y="228" font-family="sans-serif" font-size="14" fill="#334155">{["xx","yy","zz"][i]}</text>')
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="660" height="285" viewBox="0 0 660 285" role="img" aria-labelledby="title desc"><title id="title">Invented Born-charge and dielectric ledger</title><desc id="desc">Original stacked bars of invented electronic and ionic dielectric contributions plus a componentwise Born-charge sum rule.</desc><rect width="660" height="285" fill="white"/><text x="48" y="35" font-family="sans-serif" font-size="18" fill="#0f172a">invented ε∞ plus εion equals ε₀</text><line x1="72" y1="205" x2="485" y2="205" stroke="#334155"/>{''.join(bars)}<rect x="430" y="70" width="190" height="105" rx="8" fill="#f1f5f9" stroke="#64748b"/><text x="448" y="102" font-family="sans-serif" font-size="15" fill="#0f172a">invented two-sublattice Z*</text><text x="448" y="129" font-family="sans-serif" font-size="14" fill="#334155">Σκ Z*κ,αβ = 0</text><text x="448" y="151" font-family="sans-serif" font-size="13" fill="#334155">componentwise closure only</text><text x="75" y="259" font-family="sans-serif" font-size="13" fill="#334155">blue: invented ion-clamped term; orange: invented ionic term; no material response is represented</text></svg>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert all(value == 0.0 for row in result["born_charge_acoustic_sum"] for value in row)
    assert result["epsilon_zero_diagonal"] == [4.5, 4.0, 4.300000000000001]
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
    print("Invented Born-charge/dielectric fixture passed; it verifies tensor ledger arithmetic and SVG rendering only.")


if __name__ == "__main__":
    main()
