"""Deterministic teaching fixture for unwrapping a polarization branch; no DFT is run."""
from __future__ import annotations

import argparse
from pathlib import Path


def unwrap(values: list[float], quantum: float) -> list[float]:
    result = [values[0]]
    for value in values[1:]:
        candidates = [value + n * quantum for n in range(-3, 4)]
        result.append(min(candidates, key=lambda item: abs(item - result[-1])))
    return result


def run() -> dict[str, object]:
    quantum = 1.00
    reported = [0.00, 0.18, 0.37, -0.44, -0.25]
    path = unwrap(reported, quantum)
    assert path == [0.00, 0.18, 0.37, 0.56, 0.75]
    assert all(abs(b - a) < 0.5 * quantum for a, b in zip(path, path[1:]))
    return {"fixture":"invented insulating interpolation", "polarization_quantum":quantum, "reported_branch":reported, "unwrapped_branch":path, "boundary":"Invented branch-continuity arithmetic only; no Berry-phase, DFT, switching, or material calculation."}


def write_svg(svg: Path) -> None:
    result = run()
    path = result["unwrapped_branch"]
    points = ' '.join(f'{50 + i * 75},{170 - value * 120:.1f}' for i, value in enumerate(path))
    svg.parent.mkdir(parents=True, exist_ok=True)
    svg.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 220" role="img" aria-labelledby="t d"><title id="t">Invented polarization branch path</title><desc id="d">A deterministic invented Berry-phase branch is unwrapped continuously along an insulating teaching path.</desc><rect width="390" height="220" fill="#fff"/><path d="M45 20V180H365" stroke="#1f2937" fill="none"/><polyline points="{points}" fill="none" stroke="#0f766e" stroke-width="4"/><text x="48" y="205" font-size="13">interpolation coordinate λ</text><text x="12" y="18" font-size="13">ΔP (invented units)</text><text x="50" y="38" font-size="12">continuous branch; quantum = 1.00</text></svg>''', encoding="utf-8")
    print("Polarization branch fixture passed: invented branch continuity and SVG rendering.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path, required=True)
    args = parser.parse_args()
    result = run()
    if args.svg:
        write_svg(args.svg)
    print(result)
    print("Polarization branch fixture passed: invented branch continuity and SVG rendering only.")
