"""Invented piezoelectric ledger; deterministic arithmetic, not a DFPT calculation."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    # Invented C/m² components in an explicitly chosen Voigt convention.
    clamped = [0.18, -0.05, 0.11]
    internal = [0.42, 0.09, -0.16]
    total = [a + b for a, b in zip(clamped, internal)]
    compliance = [2.0, 1.5, 0.8]  # invented reciprocal-stiffness factors
    strain_coefficients = [a * b for a, b in zip(total, compliance)]
    return {
        "fixture": "invented piezoelectric tensor ledger",
        "voigt_convention": "invented components e_31, e_32, e_33; stress sign and axes declared locally",
        "clamped_e": clamped,
        "internal_e": internal,
        "total_e": total,
        "invented_compliance": compliance,
        "derived_d": strain_coefficients,
        "boundary": "Invented arithmetic only; no DFPT, strain perturbation, material tensor, or device claim.",
    }


def svg(result: dict[str, object]) -> str:
    c, i, t = result["clamped_e"], result["internal_e"], result["total_e"]
    bars = ''.join(f'<rect x="{70+n*110}" y="{175-(c[n]+i[n])*150:.1f}" width="26" height="{c[n]*150:.1f}" fill="#2563eb"/><rect x="{70+n*110}" y="{175-(c[n]+i[n])*150:.1f}" width="26" height="{i[n]*150:.1f}" fill="#f97316"/><text x="{66+n*110}" y="200" font-size="13">e3{n+1}</text><text x="{65+n*110}" y="{165-(c[n]+i[n])*150:.1f}" font-size="11">{t[n]:.2f}</text>' for n in range(3))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 430 240" role="img" aria-labelledby="t d"><title id="t">Invented piezoelectric ledger</title><desc id="d">Invented clamped and internal contributions form three explicitly labelled piezoelectric components.</desc><rect width="430" height="240" fill="white"/><text x="36" y="30" font-size="17">invented e = e clamped + e internal</text><path d="M45 175H395" stroke="#334155"/>{bars}<text x="45" y="224" font-size="12">blue: clamped; orange: internal; no material response represented</text></svg>'


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert result["total_e"] == [0.6, 0.039999999999999994, -0.05]
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
