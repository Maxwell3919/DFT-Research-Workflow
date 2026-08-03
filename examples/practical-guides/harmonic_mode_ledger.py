"""Invented harmonic-mode ledger; no force calculation, DFPT, or phonon solve is run."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    # Invented mass-weighted eigenvalues in arbitrary squared-frequency units.
    eigenvalues = [0.0, 0.0, 0.0, 4.0, 9.0, -1.0]
    frequencies = [0.0 if value == 0 else (value ** 0.5 if value > 0 else -((-value) ** 0.5)) for value in eigenvalues]
    return {
        "fixture": "invented harmonic dynamical-matrix eigenvalue ledger",
        "eigenvalues": eigenvalues,
        "display_frequencies": frequencies,
        "acoustic_modes_at_gamma": 3,
        "imaginary_mode_interpretation": "negative displayed value is an invented negative curvature diagnostic, not a stability conclusion",
        "boundary": "Invented arithmetic only; no DFT forces, force constants, dynamical matrix, phonon dispersion, or material stability result.",
    }


def svg(result: dict[str, object]) -> str:
    values=result["display_frequencies"]
    bars=''.join(f'<rect x="{55+i*52}" y="{150-(max(v,0)*28):.1f}" width="25" height="{abs(v)*28:.1f}" fill="{"#dc2626" if v<0 else "#2563eb"}"/><text x="{55+i*52}" y="190" font-size="11">{i+1}</text>' for i,v in enumerate(values))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 230" role="img" aria-labelledby="t d"><title id="t">Invented harmonic mode ledger</title><desc id="d">Three invented acoustic zero modes, two positive modes, and one negative-curvature diagnostic are shown.</desc><rect width="390" height="230" fill="white"/><text x="30" y="30" font-size="16">invented ω² eigenvalue ledger</text><path d="M35 150H365" stroke="#334155"/>{bars}<text x="35" y="215" font-size="11">blue: positive; red: invented negative-curvature diagnostic</text></svg>'


if __name__ == "__main__":
    parser=argparse.ArgumentParser(); parser.add_argument("--svg",type=Path); args=parser.parse_args(); result=run(); assert result["display_frequencies"]==[0.0,0.0,0.0,2.0,3.0,-1.0]
    if args.svg: args.svg.parent.mkdir(parents=True,exist_ok=True); args.svg.write_text(svg(result),encoding="utf-8")
    print(result)
