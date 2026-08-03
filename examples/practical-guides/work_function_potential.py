from __future__ import annotations

import argparse
import json
import math
from pathlib import Path


FERMI_EV = -4.65


def profile(z: float) -> float:
    left, right = 0.18, 0.67
    if z <= 4.5:
        return left
    if z >= 25.5:
        return right
    left_step = 1 / (1 + math.exp(-(z - 6.2) * 2.4))
    right_step = 1 / (1 + math.exp(-(z - 23.8) * 2.4))
    slab_oscillation = 0.55 * math.sin(2.8 * z) * left_step * (1 - right_step)
    return left * (1 - left_step) + (-8.1 + slab_oscillation) * left_step * (1 - right_step) + right * right_step


def average(values: list[float]) -> float:
    return sum(values) / len(values)


def analyze() -> dict[str, object]:
    points = [{"z_a": i * 0.1, "potential_ev": profile(i * 0.1)} for i in range(301)]
    left = [p["potential_ev"] for p in points if 1.0 <= p["z_a"] <= 4.5]
    right = [p["potential_ev"] for p in points if 25.5 <= p["z_a"] <= 29.0]
    left_vac, right_vac = average(left), average(right)
    left_span, right_span = max(left) - min(left), max(right) - min(right)
    assert left_span < 1e-8 and right_span < 1e-8
    assert abs(left_vac - 0.18) < 1e-8 and abs(right_vac - 0.67) < 1e-8
    return {
        "fixture_type": "synthetic planar electrostatic-potential profile",
        "fermi_energy_eV": FERMI_EV,
        "left": {"vacuum_eV": left_vac, "plateau_span_eV": left_span, "work_function_eV": left_vac - FERMI_EV},
        "right": {"vacuum_eV": right_vac, "plateau_span_eV": right_span, "work_function_eV": right_vac - FERMI_EV},
        "points": points,
        "evidence_boundary": "The profile is analytic and invented; it tests plateau extraction and side-specific subtraction, not a DFT work function.",
    }


def render_svg(result: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    points = result["points"]
    x0, y0, width, height = 90, 70, 700, 330
    ymin, ymax = -9.0, 1.3
    def xy(p: dict[str, float]) -> tuple[float, float]:
        return x0 + p["z_a"] / 30 * width, y0 + (ymax - p["potential_ev"]) / (ymax - ymin) * height
    line = " ".join(f"{x:.1f},{y:.1f}" for x, y in map(xy, points))
    fy = y0 + (ymax - FERMI_EV) / (ymax - ymin) * height
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="530" viewBox="0 0 900 530" role="img" aria-labelledby="title desc">
<title id="title">Synthetic side-specific work-function extraction</title><desc id="desc">An invented planar-averaged potential has two flat vacuum plateaus and one Fermi level, giving different left and right work functions.</desc>
<rect width="900" height="530" fill="#f5f7f7"/><text x="70" y="40" font-family="sans-serif" font-size="25" font-weight="700" fill="#172a3a">Two surfaces can have two vacuum levels</text>
<rect x="{x0+145}" y="{y0}" width="410" height="{height}" fill="#e7dfcf" opacity="0.75"/><text x="420" y="95" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#5f513e">slab region</text>
<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0+height}" stroke="#263746"/><line x1="{x0}" y1="{y0+height}" x2="{x0+width}" y2="{y0+height}" stroke="#263746"/>
<polyline points="{line}" fill="none" stroke="#2b6f8c" stroke-width="3"/><line x1="{x0}" y1="{fy:.1f}" x2="{x0+width}" y2="{fy:.1f}" stroke="#c34f3e" stroke-width="3" stroke-dasharray="10 7"/>
<text x="105" y="92" font-family="sans-serif" font-size="16" fill="#2b6f8c">left E_vac = 0.18 eV</text><text x="610" y="77" font-family="sans-serif" font-size="16" fill="#2b6f8c">right E_vac = 0.67 eV</text>
<text x="650" y="{fy-8:.1f}" font-family="sans-serif" font-size="16" fill="#c34f3e">E_F = −4.65 eV</text>
<text x="118" y="445" font-family="sans-serif" font-size="16" fill="#263746">Φ_left = 4.83 eV</text><text x="595" y="445" font-family="sans-serif" font-size="16" fill="#263746">Φ_right = 5.32 eV</text>
<text x="405" y="492" font-family="sans-serif" font-size="15" text-anchor="middle" fill="#4b5964">Synthetic fixture — flatness is checked before subtraction.</text>
</svg>'''
    target.write_text(svg, encoding="utf-8")


def run() -> dict[str, object]:
    report = analyze()
    assert abs(report["left"]["work_function_eV"] - 4.83) < 1e-8
    assert abs(report["right"]["work_function_eV"] - 5.32) < 1e-8
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    report = run()
    if args.svg:
        render_svg(report, args.svg)
    print(json.dumps(report, indent=2))
