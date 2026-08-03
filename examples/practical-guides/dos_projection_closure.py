#!/usr/bin/env python3
"""Deterministic invented-DOS integration and projection-closure fixture; no DFT."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


ENERGY = [-2.0, -1.0, 0.0, 1.0, 2.0]
TOTAL = [0.1, 1.0, 0.4, 0.8, 0.2]
SITE_A = [0.03, 0.42, 0.18, 0.30, 0.06]
SITE_B = [0.02, 0.35, 0.12, 0.24, 0.05]


def trapz(y: list[float]) -> float:
    return sum((ENERGY[index + 1] - ENERGY[index]) * (y[index] + y[index + 1]) / 2 for index in range(len(y) - 1))


def run() -> dict[str, object]:
    total = trapz(TOTAL)
    projected = trapz([a + b for a, b in zip(SITE_A, SITE_B)])
    report = {'fixture': 'invented DOS/projection arrays', 'energy_unit': 'eV', 'dos_unit': 'invented states/eV/cell', 'total_integral': total, 'selected_projection_integral': projected, 'unassigned_residual': total - projected}
    if not (total > projected > 0):
        raise SystemExit('fixture must retain a positive projection residual')
    return report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--svg', type=Path, required=True)
    args = parser.parse_args()
    report = run()
    args.svg.parent.mkdir(parents=True, exist_ok=True)
    args.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420" role="img"><title>Invented DOS closure</title><rect width="900" height="420" fill="#f8f5ee"/><text x="45" y="55" font-family="sans-serif" font-size="27" font-weight="700">Selected projections need not close the total DOS</text><line x1="90" y1="330" x2="830" y2="330" stroke="#52616b"/><polyline fill="none" stroke="#2b6f8c" stroke-width="4" points="90,300 275,100 460,220 645,140 830,280"/><polyline fill="none" stroke="#a33d2d" stroke-width="4" points="90,316 275,175 460,270 645,210 830,308"/><text x="90" y="380" font-family="sans-serif" font-size="17">Invented total DOS (blue) and selected local projections (red) · residual retained</text></svg>', encoding='utf-8')
    print(json.dumps(report, indent=2))
    print('Execution establishes invented-array integration and residual reporting only; it is not a DFT calculation.')


if __name__ == '__main__':
    main()
