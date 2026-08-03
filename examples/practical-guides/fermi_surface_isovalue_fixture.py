#!/usr/bin/env python3
"""Invented full-zone isovalue fixture; it does not run electronic-structure code."""
from __future__ import annotations
import argparse, json
from pathlib import Path

def field(x: float, y: float) -> float:
    return (x - 0.25) ** 2 + (y + 0.15) ** 2 - 0.12

def run() -> dict[str, object]:
    grid = [(i / 8 - .5, j / 8 - .5) for i in range(9) for j in range(9)]
    mu = 0.0
    full = sum(abs(field(x, y) - mu) < .035 for x, y in grid)
    path = [(t / 8 - .5, t / 8 - .5) for t in range(9)]
    line = sum(abs(field(x, y) - mu) < .035 for x, y in path)
    shifted = sum(abs(field(x, y) - .06) < .035 for x, y in grid)
    if not (full > line >= 0 and shifted != full): raise RuntimeError('fixture must distinguish full grid, path, and isovalue')
    return {'fixture':'invented 2D reciprocal energy field','isovalue':mu,'full_grid_crossing_cells':full,'diagonal_path_crossing_cells':line,'shifted_isovalue_crossing_cells':shifted}

def main() -> None:
    parser=argparse.ArgumentParser(); parser.add_argument('--svg', type=Path, required=True); args=parser.parse_args(); report=run()
    args.svg.parent.mkdir(parents=True, exist_ok=True)
    args.svg.write_text('<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420" role="img"><title>Invented full-zone isovalue</title><rect width="900" height="420" fill="#f8f5ee"/><text x="45" y="50" font-family="sans-serif" font-size="27" font-weight="700">A path crossing is not a full-zone pocket</text><circle cx="460" cy="220" r="110" fill="none" stroke="#2b6f8c" stroke-width="5"/><line x1="170" y1="350" x2="700" y2="80" stroke="#a33d2d" stroke-width="5"/><text x="80" y="390" font-family="sans-serif" font-size="18">Invented equal-energy contour (blue) and one path (red) · no material calculation</text></svg>',encoding='utf-8')
    print(json.dumps(report,indent=2)); print('Execution establishes invented-grid logic only; it is not a Fermi-surface calculation.')
if __name__ == '__main__': main()
