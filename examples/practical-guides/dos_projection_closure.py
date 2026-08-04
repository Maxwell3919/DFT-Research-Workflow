#!/usr/bin/env python3
"""Reconstruct the bounded Silicon QE 7.5 total-DOS teaching plot."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

DATA = Path('examples/practical-guides/data/silicon-qe/si.dos.dat')
EXPECTED_SHA256 = 'dc3bd84a740a572d665b3e39bdfb642dd61746e4c3c095ec18ae24ff96123db3'


def load(path: Path) -> tuple[float, list[tuple[float, float]]]:
    header, *rows = path.read_text(encoding='utf-8').splitlines()
    fermi = float(header.split('EFermi =')[1].split()[0])
    return fermi, [(float(row.split()[0]), float(row.split()[1])) for row in rows if row.strip()]


def points(rows: list[tuple[float, float]], fermi: float) -> str:
    maximum = max(value for _, value in rows) or 1.0
    selected = rows[::8]
    return ' '.join(f'{90 + (energy - fermi + 12) / 24 * 740:.1f},{330 - value / maximum * 220:.1f}' for energy, value in selected)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--svg', type=Path, required=True)
    args = parser.parse_args()
    digest = hashlib.sha256(DATA.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise SystemExit(f'Unexpected QE DOS SHA-256: {digest}')
    fermi, rows = load(DATA)
    args.svg.parent.mkdir(parents=True, exist_ok=True)
    args.svg.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="420" viewBox="0 0 900 420" role="img"><title>Silicon QE total density of states</title><rect width="900" height="420" fill="#f8f5ee"/><text x="45" y="55" font-family="sans-serif" font-size="25" font-weight="700">Silicon total DOS from QE 7.5 output</text><line x1="90" y1="330" x2="830" y2="330" stroke="#52616b"/><line x1="460" y1="95" x2="460" y2="330" stroke="#a33d2d" stroke-dasharray="7 6"/><polyline fill="none" stroke="#2b6f8c" stroke-width="3" points="{points(rows, fermi)}"/><text x="470" y="115" font-family="sans-serif" font-size="16">E_F = {fermi:.3f} eV</text><text x="90" y="380" font-family="sans-serif" font-size="17">Energy relative to E_F (eV) · total states/eV/cell · 12×12×12 teaching mesh</text></svg>''', encoding='utf-8')
    print(json.dumps({'material': 'Silicon COD 9013102', 'qe_version': '7.5', 'dos_sha256': digest, 'fermi_eV': fermi, 'points': len(rows), 'execution': 'SCF -> NSCF -> dos.x completed'}, indent=2))
    print('Execution verifies stored-output identity and plot reconstruction only; numerical convergence and material conclusions remain unassessed.')


if __name__ == '__main__':
    main()
