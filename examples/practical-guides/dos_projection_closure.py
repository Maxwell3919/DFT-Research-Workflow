#!/usr/bin/env python3
"""Reconstruct the bounded Silicon QE 7.5 total-DOS teaching plot."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / 'examples/practical-guides/data/silicon-qe/si.dos.dat'
EXPECTED_SHA256 = 'dc3bd84a740a572d665b3e39bdfb642dd61746e4c3c095ec18ae24ff96123db3'


def load(path: Path) -> tuple[float, list[tuple[float, float]]]:
    header, *rows = path.read_text(encoding='utf-8').splitlines()
    fermi = float(header.split('EFermi =')[1].split()[0])
    return fermi, [(float(row.split()[0]), float(row.split()[1])) for row in rows if row.strip()]


def chart(rows: list[tuple[float, float]], fermi: float) -> dict[str, object]:
    relative = [(energy - fermi, value) for energy, value in rows]
    energy_min = min(energy for energy, _ in relative)
    energy_max = max(energy for energy, _ in relative)
    dos_limit = math.ceil(max(value for _, value in relative) * 2) / 2 or 1.0

    def xmap(energy: float) -> float:
        return 90 + (energy - energy_min) / (energy_max - energy_min) * 740

    def ymap(value: float) -> float:
        return 330 - value / dos_limit * 220

    curve = ' '.join(f'{xmap(energy):.1f},{ymap(value):.1f}' for energy, value in relative)
    x_ticks = ''.join(
        f'<line x1="{xmap(value):.1f}" y1="330" x2="{xmap(value):.1f}" y2="337" stroke="#52616b"/>'
        f'<text x="{xmap(value):.1f}" y="357" text-anchor="middle" font-family="sans-serif" font-size="13">{value:+.0f}</text>'
        for value in (-18.0, -12.0, -6.0, 0.0)
        if energy_min <= value <= energy_max
    )
    y_ticks = ''.join(
        f'<line x1="83" y1="{ymap(value):.1f}" x2="90" y2="{ymap(value):.1f}" stroke="#52616b"/>'
        f'<text x="76" y="{ymap(value) + 5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13">{value:.1f}</text>'
        for value in (0.0, 0.5, 1.0, 1.5, 2.0, 2.5)
        if value <= dos_limit
    )
    return {
        'curve': curve,
        'fermi_x': xmap(0.0),
        'energy_min': energy_min,
        'energy_max': energy_max,
        'dos_limit': dos_limit,
        'x_ticks': x_ticks,
        'y_ticks': y_ticks,
    }


def run() -> dict[str, object]:
    digest = hashlib.sha256(DATA.read_bytes()).hexdigest()
    if digest != EXPECTED_SHA256:
        raise RuntimeError(f'Unexpected QE DOS SHA-256: {digest}')
    fermi, rows = load(DATA)
    return {'material': 'Silicon COD 9013102', 'qe_version': '7.5', 'dos_sha256': digest, 'fermi_eV': fermi, 'points': len(rows), 'execution': 'SCF -> NSCF -> dos.x completed'}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--svg', type=Path, required=True)
    args = parser.parse_args()
    report = run()
    fermi, rows = load(DATA)
    plot = chart(rows, fermi)
    args.svg.parent.mkdir(parents=True, exist_ok=True)
    args.svg.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="470" viewBox="0 0 900 470" role="img" aria-labelledby="t d"><title id="t">Silicon QE total density of states</title><desc id="d">Retained Quantum ESPRESSO 7.5 Silicon total DOS on a 12 by 12 by 12 teaching mesh, plotted over the complete stored energy grid relative to the recorded 6.655 electronvolt Fermi reference.</desc><rect width="900" height="470" fill="#f8f5ee"/><text x="45" y="48" font-family="sans-serif" font-size="25" font-weight="700">Silicon total DOS from QE 7.5 output</text><text x="45" y="75" font-family="sans-serif" font-size="14" fill="#52616b">481 stored points · 12×12×12 teaching mesh · E_F = {fermi:.3f} eV</text><line x1="90" y1="330" x2="830" y2="330" stroke="#52616b"/><line x1="90" y1="100" x2="90" y2="330" stroke="#52616b"/>{plot['x_ticks']}{plot['y_ticks']}<line x1="{plot['fermi_x']:.1f}" y1="100" x2="{plot['fermi_x']:.1f}" y2="330" stroke="#a33d2d" stroke-width="2" stroke-dasharray="7 6"/><polyline fill="none" stroke="#2b6f8c" stroke-width="3" stroke-linejoin="round" points="{plot['curve']}"/><text x="{plot['fermi_x'] + 10:.1f}" y="118" font-family="sans-serif" font-size="14" fill="#a33d2d">E − E_F = 0</text><text x="460" y="389" text-anchor="middle" font-family="sans-serif" font-size="16">Energy relative to E_F (eV)</text><text x="24" y="215" transform="rotate(-90 24 215)" text-anchor="middle" font-family="sans-serif" font-size="16">DOS (states/eV/cell)</text><text x="45" y="425" font-family="sans-serif" font-size="13" fill="#52616b">Stored window: {plot['energy_min']:.3f} to {plot['energy_max']:.3f} eV relative to E_F; no data were cropped from the plotted curve.</text><text x="45" y="450" font-family="sans-serif" font-size="13" fill="#52616b">One retained mesh: not a k-mesh, broadening, electron-count, or projection-closure result.</text></svg>''', encoding='utf-8')
    print(json.dumps(report, indent=2))
    print('Execution verifies stored-output identity and plot reconstruction only; numerical convergence and material conclusions remain unassessed.')


if __name__ == '__main__':
    main()
