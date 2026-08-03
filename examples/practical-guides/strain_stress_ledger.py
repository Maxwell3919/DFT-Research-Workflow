"""Invented strain--stress ledger; this is not a DFT calculation."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    strains = [-0.002, -0.001, 0.001, 0.002]
    stresses = [-0.40, -0.20, 0.20, 0.40]
    slope = sum(e * s for e, s in zip(strains, stresses)) / sum(e * e for e in strains)
    c11, c12, c44 = 200.0, 80.0, 60.0
    residual = max(abs(s - slope * e) for e, s in zip(strains, stresses))
    return {
        "fixture": "invented signed uniaxial strain--stress rows",
        "strain_convention": "dimensionless engineering normal strain, one declared Cartesian component",
        "stress_unit": "invented pressure units",
        "fitted_C11": slope,
        "max_fit_residual": residual,
        "invented_cubic_matrix_entries": {"C11": c11, "C12": c12, "C44": c44},
        "cubic_local_stability": {"C11_minus_C12_positive": c11 - c12 > 0, "C11_plus_2C12_positive": c11 + 2 * c12 > 0, "C44_positive": c44 > 0},
        "boundary": "Invented arithmetic only; no electronic stress, elastic tensor, stability, strength, or material conclusion.",
    }


def svg(result: dict[str, object]) -> str:
    points = [(110, 210), (205, 160), (395, 60), (490, 10)]
    circles = ''.join(f'<circle cx="{x}" cy="{y}" r="7" fill="#2563eb"/>' for x, y in points)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="660" height="290" viewBox="0 0 660 290" role="img" aria-labelledby="title desc"><title id="title">Invented signed strain--stress ledger</title><desc id="desc">Original plot of invented signed normal strains and stresses with a fitted line and declared cubic stability checks.</desc><rect width="660" height="290" fill="white"/><line x1="72" y1="235" x2="540" y2="235" stroke="#334155"/><line x1="300" y1="35" x2="300" y2="245" stroke="#cbd5e1"/><line x1="72" y1="125" x2="540" y2="125" stroke="#cbd5e1"/><line x1="95" y1="218" x2="505" y2="2" stroke="#64748b" stroke-width="3"/>{circles}<text x="78" y="32" font-family="sans-serif" font-size="17" fill="#0f172a">invented stress versus signed normal strain</text><text x="410" y="95" font-family="sans-serif" font-size="14" fill="#334155">fitted slope: {result["fitted_C11"]:.0f}</text><rect x="410" y="145" width="205" height="84" rx="8" fill="#f1f5f9" stroke="#64748b"/><text x="425" y="173" font-family="sans-serif" font-size="14" fill="#0f172a">invented cubic checks</text><text x="425" y="198" font-family="sans-serif" font-size="13" fill="#334155">C11 − C12 &gt; 0</text><text x="425" y="218" font-family="sans-serif" font-size="13" fill="#334155">C11 + 2C12 &gt; 0; C44 &gt; 0</text><text x="78" y="270" font-family="sans-serif" font-size="13" fill="#334155">illustrative ledger only; no material stress tensor is represented</text></svg>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert abs(result["fitted_C11"] - 200.0) < 1e-12
    assert result["max_fit_residual"] < 1e-12
    assert all(result["cubic_local_stability"].values())
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
    print("Invented strain--stress fixture passed; it verifies ledger arithmetic and SVG rendering only.")


if __name__ == "__main__":
    main()
