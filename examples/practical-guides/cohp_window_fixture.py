"""Invented COHP-style energy-window bookkeeping; it does not run DFT or a projection."""
from __future__ import annotations

import argparse
from pathlib import Path


def run() -> dict[str, float | str]:
    energy = [-2.0, -1.0, 0.0, 1.0]
    minus_cohp = [0.30, 0.20, -0.10, -0.20]
    occupied_integral = sum(value for e, value in zip(energy, minus_cohp) if e <= 0.0)
    return {"fixture": "invented energy-resolved pair terms", "occupied_minus_icoHP": occupied_integral, "energy_reference": "invented eV reference"}


def svg(result: dict[str, float | str]) -> str:
    values = [0.30, 0.20, -0.10, -0.20]
    points = " ".join(f"{70 + i * 130},{150 - value * 180}" for i, value in enumerate(values))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="620" height="260" viewBox="0 0 620 260" role="img" aria-labelledby="title desc"><title id="title">Invented pair-resolved bonding ledger</title><desc id="desc">An original line diagram of invented minus COHP values with an occupied energy boundary.</desc><rect width="620" height="260" fill="white"/><line x1="55" y1="150" x2="575" y2="150" stroke="#334155"/><line x1="55" y1="35" x2="55" y2="220" stroke="#334155"/><line x1="330" y1="35" x2="330" y2="220" stroke="#64748b" stroke-dasharray="5 5"/><polyline points="{points}" fill="none" stroke="#2563eb" stroke-width="4"/><text x="337" y="55" fill="#334155" font-family="sans-serif" font-size="15">invented occupied boundary</text><text x="64" y="240" fill="#334155" font-family="sans-serif" font-size="15">invented energy reference</text><text x="65" y="28" fill="#334155" font-family="sans-serif" font-size="16">-COHP (invented pair contribution)</text><text x="65" y="85" fill="#2563eb" font-family="sans-serif" font-size="16">occupied integral = {result['occupied_minus_icoHP']:.2f} invented units</text></svg>'''


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    assert result["occupied_minus_icoHP"] == 0.4
    if args.svg:
        args.svg.parent.mkdir(parents=True, exist_ok=True)
        args.svg.write_text(svg(result), encoding="utf-8")
    print(result)
    print("Invented COHP-window fixture passed; it verifies arithmetic and SVG rendering only.")


if __name__ == "__main__":
    main()
