"""Invented three-phonon linewidth ledger; no force, phonon, or transport calculation is run."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, object]:
    channels = [
        {"label": "decay", "matrix_element_squared": 0.8, "phase_space_weight": 0.25},
        {"label": "absorption", "matrix_element_squared": 0.5, "phase_space_weight": 0.40},
        {"label": "off-shell", "matrix_element_squared": 0.9, "phase_space_weight": 0.00},
    ]
    contributions = [round(row["matrix_element_squared"] * row["phase_space_weight"], 6) for row in channels]
    return {
        "fixture": "invented three-phonon linewidth ledger",
        "channels": channels,
        "on_shell_contributions": contributions,
        "invented_linewidth": round(sum(contributions), 6),
        "boundary": "Invented multiplication and on-shell bookkeeping only; no forces, force constants, phonon self-energy, lifetime, or thermal conductivity.",
    }


def svg(result: dict[str, object]) -> str:
    values = result["on_shell_contributions"]
    bars = ''.join(f'<rect x="{65 + 100*i}" y="{155 - value*180:.1f}" width="46" height="{value*180:.1f}" fill="#2563eb"/><text x="{65 + 100*i}" y="180" font-size="11">{["decay", "absorb", "off-shell"][i]}</text>' for i, value in enumerate(values))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 225" role="img" aria-labelledby="t d"><title id="t">Invented anharmonic linewidth ledger</title><desc id="d">Two invented on-shell channel contributions and one excluded off-shell channel form an invented linewidth ledger.</desc><rect width="390" height="225" fill="white"/><text x="28" y="30" font-size="16">invented three-phonon ledger</text><path d="M40 155H355" stroke="#334155"/>{bars}<text x="28" y="210" font-size="11">Only declared on-shell weights enter this invented arithmetic.</text></svg>'


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert result["invented_linewidth"] == 0.4
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
