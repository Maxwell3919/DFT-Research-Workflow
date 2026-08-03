"""Trace a synthetic defect charge-state envelope and a toy neutrality root."""

from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Any


GAP_EV = 3.0
INTERCEPTS_EV = {2: 0.8, 1: 1.8, 0: 2.0, -1: 3.7}
TEMPERATURE_K = 900.0
BOLTZMANN_EV_PER_K = 8.617333262145e-5
SITE_DENSITY_CM3 = 1.0e22
NC_CM3 = 1.0e19
NV_CM3 = 1.0e19
FIXED_DONOR_CM3 = 1.0e16


def formation_energy(charge: int, fermi_level_eV: float) -> float:
    return INTERCEPTS_EV[charge] + charge * fermi_level_eV


def stable_charge(fermi_level_eV: float) -> int:
    return min(INTERCEPTS_EV, key=lambda charge: (formation_energy(charge, fermi_level_eV), -charge))


def defect_concentrations(fermi_level_eV: float) -> dict[int, float]:
    thermal_energy = BOLTZMANN_EV_PER_K * TEMPERATURE_K
    return {
        charge: SITE_DENSITY_CM3 * math.exp(-formation_energy(charge, fermi_level_eV) / thermal_energy)
        for charge in INTERCEPTS_EV
    }


def neutrality_terms(fermi_level_eV: float) -> dict[str, Any]:
    thermal_energy = BOLTZMANN_EV_PER_K * TEMPERATURE_K
    concentrations = defect_concentrations(fermi_level_eV)
    holes = NV_CM3 * math.exp(-fermi_level_eV / thermal_energy)
    electrons = NC_CM3 * math.exp(-(GAP_EV - fermi_level_eV) / thermal_energy)
    charged_defects = sum(charge * concentration for charge, concentration in concentrations.items())
    residual = charged_defects + holes + FIXED_DONOR_CM3 - electrons
    return {
        "charged_defects_cm-3": charged_defects,
        "holes_cm-3": holes,
        "fixed_ionized_donors_cm-3": FIXED_DONOR_CM3,
        "electrons_cm-3": electrons,
        "residual_positive_minus_negative_cm-3": residual,
        "defect_charge_state_concentrations_cm-3": {str(charge): value for charge, value in concentrations.items()},
    }


def solve_neutrality() -> float:
    lower, upper = 0.0, GAP_EV
    lower_residual = neutrality_terms(lower)["residual_positive_minus_negative_cm-3"]
    upper_residual = neutrality_terms(upper)["residual_positive_minus_negative_cm-3"]
    if lower_residual * upper_residual >= 0:
        raise RuntimeError("fixture neutrality root is not bracketed")
    for _ in range(120):
        middle = (lower + upper) / 2.0
        residual = neutrality_terms(middle)["residual_positive_minus_negative_cm-3"]
        if residual > 0:
            lower = middle
        else:
            upper = middle
    return (lower + upper) / 2.0


def run() -> dict[str, Any]:
    transition_plus2_zero = (INTERCEPTS_EV[0] - INTERCEPTS_EV[2]) / (2 - 0)
    transition_zero_minus1 = (INTERCEPTS_EV[-1] - INTERCEPTS_EV[0]) / (0 - (-1))
    samples = [0.0, 0.3, transition_plus2_zero, 1.0, transition_zero_minus1, 2.2, GAP_EV]
    stable = [{"fermi_level_eV": value, "stable_charge": stable_charge(value), "formation_energy_eV": formation_energy(stable_charge(value), value)} for value in samples]
    root = solve_neutrality()
    root_terms = neutrality_terms(root)
    report = {
        "fixture": "invented four-charge-state defect in an abstract 3 eV-gap host",
        "fermi_level_domain_eV_above_vbm": [0.0, GAP_EV],
        "formation_energy_intercepts_at_vbm_eV": {str(charge): value for charge, value in INTERCEPTS_EV.items()},
        "thermodynamic_transition_levels_eV_above_vbm": {
            "+2/0": transition_plus2_zero,
            "0/-1": transition_zero_minus1,
        },
        "charge_state_plus1_on_lower_envelope": any(item["stable_charge"] == 1 for item in stable),
        "lower_envelope_samples": stable,
        "toy_neutrality_model": {
            "temperature_K": TEMPERATURE_K,
            "site_density_cm-3": SITE_DENSITY_CM3,
            "effective_band_densities_cm-3": {"Nc": NC_CM3, "Nv": NV_CM3},
            "fixed_ionized_donors_cm-3": FIXED_DONOR_CM3,
            "self_consistent_fermi_level_eV_above_vbm": root,
            "terms_at_root": root_terms,
        },
        "evidence_boundary": (
            "All energies, densities, degeneracies, band edges, and temperature are synthetic fixtures. The calculation tests envelope, "
            "transition-level, dilute Boltzmann, and charge-neutrality arithmetic only; it is not a material prediction."
        ),
    }
    assert abs(transition_plus2_zero - 0.6) < 1e-12
    assert abs(transition_zero_minus1 - 1.7) < 1e-12
    assert report["charge_state_plus1_on_lower_envelope"] is False
    assert 0.0 < root < GAP_EV
    scale = max(abs(value) for key, value in root_terms.items() if key.endswith("cm-3") and isinstance(value, float))
    assert abs(root_terms["residual_positive_minus_negative_cm-3"]) / scale < 1e-12
    return report


def render_svg(path: Path) -> None:
    report = run()
    width, height = 960, 540
    left, right, top, bottom = 88, 45, 62, 92
    plot_width, plot_height = width - left - right, height - top - bottom
    y_min, y_max = 0.0, 6.9
    colors = {2: "#26547c", 1: "#6c8ebf", 0: "#b56576", -1: "#7a5195"}

    def px(x: float) -> float:
        return left + x / GAP_EV * plot_width

    def py(y: float) -> float:
        return top + (y_max - y) / (y_max - y_min) * plot_height

    root = report["toy_neutrality_model"]["self_consistent_fermi_level_eV_above_vbm"]
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        '<title id="title">Synthetic defect charge-state formation-energy envelope</title>',
        '<desc id="desc">Four charge-state lines cross within an invented three-electron-volt gap. The plus-one line never reaches the lower envelope. Thermodynamic transitions occur at 0.6 and 1.7 electron volts, and a separate toy charge-neutrality solution is marked.</desc>',
        '<rect width="960" height="540" fill="#ffffff"/>',
        '<text x="88" y="31" font-family="Georgia,serif" font-size="21" fill="#1a1a1a">Charge-state lines, their lower envelope, and one toy neutrality root</text>',
    ]
    for tick in range(0, 7):
        svg.append(f'<line x1="{left}" y1="{py(tick):.2f}" x2="{width-right}" y2="{py(tick):.2f}" stroke="#e8e8e8"/>')
        svg.append(f'<text x="{left-12}" y="{py(tick)+5:.2f}" text-anchor="end" font-family="Arial,sans-serif" font-size="13" fill="#555">{tick}</text>')
    for tick in (0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0):
        svg.append(f'<line x1="{px(tick):.2f}" y1="{top}" x2="{px(tick):.2f}" y2="{height-bottom}" stroke="#f0f0f0"/>')
        svg.append(f'<text x="{px(tick):.2f}" y="{height-bottom+25}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#555">{tick:.1f}</text>')
    svg.extend([
        f'<line x1="{left}" y1="{height-bottom}" x2="{width-right}" y2="{height-bottom}" stroke="#222"/>',
        f'<line x1="{left}" y1="{top}" x2="{left}" y2="{height-bottom}" stroke="#222"/>',
    ])
    for charge, intercept in INTERCEPTS_EV.items():
        svg.append(f'<line x1="{px(0):.2f}" y1="{py(intercept):.2f}" x2="{px(GAP_EV):.2f}" y2="{py(intercept+charge*GAP_EV):.2f}" stroke="{colors[charge]}" stroke-width="2" stroke-dasharray="{("6 4" if charge == 1 else "none")}"/>')
        label_y = formation_energy(charge, 2.78)
        svg.append(f'<text x="{px(2.82):.2f}" y="{py(label_y)-6:.2f}" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="{colors[charge]}">q = {charge:+d}</text>')
    envelope_points = [(0.0, formation_energy(2, 0.0)), (0.6, formation_energy(2, 0.6)), (1.7, formation_energy(0, 1.7)), (3.0, formation_energy(-1, 3.0))]
    points = " ".join(f"{px(x):.2f},{py(y):.2f}" for x, y in envelope_points)
    svg.append(f'<polyline points="{points}" fill="none" stroke="#111" stroke-width="5"/>')
    for x, label in [(0.6, "ε(+2/0)"), (1.7, "ε(0/−1)")]:
        y = min(formation_energy(charge, x) for charge in INTERCEPTS_EV)
        svg.append(f'<circle cx="{px(x):.2f}" cy="{py(y):.2f}" r="5" fill="#111"/>')
        svg.append(f'<text x="{px(x):.2f}" y="{py(y)-14:.2f}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="#111">{label}</text>')
    svg.extend([
        f'<line x1="{px(root):.2f}" y1="{top}" x2="{px(root):.2f}" y2="{height-bottom}" stroke="#d17b0f" stroke-width="2" stroke-dasharray="5 4"/>',
        f'<text x="{px(root)-8:.2f}" y="{top+22}" text-anchor="end" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#9a5b08">toy neutrality root: {root:.3f} eV</text>',
        f'<text x="{left+plot_width/2:.2f}" y="{height-43}" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#222">Fermi level above the fixture VBM (eV)</text>',
        f'<text x="24" y="{top+plot_height/2:.2f}" transform="rotate(-90 24 {top+plot_height/2:.2f})" text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#222">formation energy (eV per defect)</text>',
        '<text x="88" y="516" font-family="Arial,sans-serif" font-size="12" fill="#666">Invented deterministic fixture; line slopes equal q. No DFT, measured gap, or material concentration.</text>',
        '</svg>',
    ])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(svg) + "\n", encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    arguments = parser.parse_args()
    output = run()
    if arguments.svg:
        render_svg(arguments.svg)
    print(json.dumps(output, indent=2))
