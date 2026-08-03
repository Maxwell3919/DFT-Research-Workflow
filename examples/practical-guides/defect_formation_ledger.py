"""Assemble a deterministic charged-defect formation-energy ledger."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


HOST_ENERGY_EV = -100.0
VBM_EV = 0.0
FERMI_PROBE_EV = 1.0
CHEMICAL_LIMITS = {
    "B-rich": {"B": -4.0},
    "B-poor": {"B": -5.0},
}
RECORDS = [
    {"state": "V_B^+2", "charge": 2, "defect_energy_eV": -95.5, "delta_atoms": {"B": -1}, "correction_eV": 0.3},
    {"state": "V_B^+1", "charge": 1, "defect_energy_eV": -94.4, "delta_atoms": {"B": -1}, "correction_eV": 0.2},
    {"state": "V_B^0", "charge": 0, "defect_energy_eV": -94.0, "delta_atoms": {"B": -1}, "correction_eV": 0.0},
    {"state": "V_B^-1", "charge": -1, "defect_energy_eV": -92.4, "delta_atoms": {"B": -1}, "correction_eV": 0.1},
]


def formation_components(record: dict[str, Any], chemical_potentials: dict[str, float], fermi_level_eV: float) -> dict[str, float]:
    total_energy_difference = record["defect_energy_eV"] - HOST_ENERGY_EV
    atomic_reservoir = -sum(record["delta_atoms"][element] * chemical_potentials[element] for element in record["delta_atoms"])
    electron_reservoir = record["charge"] * (VBM_EV + fermi_level_eV)
    correction = record["correction_eV"]
    total = total_energy_difference + atomic_reservoir + electron_reservoir + correction
    return {
        "defect_minus_host_eV": total_energy_difference,
        "atomic_reservoir_eV": atomic_reservoir,
        "electron_reservoir_eV": electron_reservoir,
        "finite_size_scheme_total_eV": correction,
        "formation_energy_eV": total,
    }


def run() -> dict[str, Any]:
    limits: dict[str, list[dict[str, Any]]] = {}
    for limit, chemical_potentials in CHEMICAL_LIMITS.items():
        rows = []
        for record in RECORDS:
            intercept = formation_components(record, chemical_potentials, 0.0)
            probe = formation_components(record, chemical_potentials, FERMI_PROBE_EV)
            rows.append({
                "state": record["state"],
                "charge": record["charge"],
                "delta_atoms": record["delta_atoms"],
                "chemical_potentials_eV_per_atom": chemical_potentials,
                "intercept_at_vbm": intercept,
                "at_fermi_probe": probe,
            })
        limits[limit] = rows

    rich_intercepts = [row["intercept_at_vbm"]["formation_energy_eV"] for row in limits["B-rich"]]
    poor_intercepts = [row["intercept_at_vbm"]["formation_energy_eV"] for row in limits["B-poor"]]
    slopes = [row["at_fermi_probe"]["formation_energy_eV"] - row["intercept_at_vbm"]["formation_energy_eV"] for row in limits["B-rich"]]
    report = {
        "fixture": "abstract AB host and B vacancy; all energies are invented",
        "sign_convention": "delta_atoms is positive when an atom is added to the defect cell; charge is positive when electrons are removed",
        "equation": "E_f = E_def - E_host - sum(delta_n_i * mu_i) + q * (E_VBM + E_F) + E_corr",
        "host_energy_eV": HOST_ENERGY_EV,
        "vbm_reference_eV": VBM_EV,
        "fermi_probe_eV_above_vbm": FERMI_PROBE_EV,
        "correction_convention": "one scheme-total term already containing its defined reference/alignment contribution; no second potential-alignment term is added",
        "limits": limits,
        "evidence_boundary": (
            "The ledger tests signs, components, and charge slopes for invented values. It does not run DFT, validate a correction scheme, "
            "converge a supercell, identify a real defect, or predict a concentration."
        ),
    }
    assert all(abs(value - expected) < 1e-12 for value, expected in zip(rich_intercepts, [0.8, 1.8, 2.0, 3.7], strict=True))
    assert all(abs((rich - poor) - 1.0) < 1e-12 for rich, poor in zip(rich_intercepts, poor_intercepts, strict=True))
    assert all(abs(value - charge) < 1e-12 for value, charge in zip(slopes, [2, 1, 0, -1], strict=True))
    return report


def render_svg(path: Path) -> None:
    report = run()
    rows = report["limits"]["B-rich"]
    width, height = 960, 500
    colors = ["#26547c", "#4f7cac", "#b56576", "#7a5195"]
    x_positions = [120, 310, 500, 690, 855]
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title desc">',
        '<title id="title">Component ledger for four synthetic charge states of one defect</title>',
        '<desc id="desc">Four rows show defect-minus-host energy, atomic reservoir, electron reservoir at a one-electron-volt Fermi-level probe, one finite-size scheme total, and the resulting formation energy.</desc>',
        '<rect width="960" height="500" fill="#ffffff"/>',
        '<text x="70" y="34" font-family="Georgia,serif" font-size="21" fill="#1a1a1a">Every defect line is a sum of traceable terms</text>',
    ]
    headings = ["Edef − Ehost", "atomic reservoir", "q(EVBM + EF)", "scheme-total Ecorr", "Ef at EF = 1 eV"]
    for x, heading in zip(x_positions, headings, strict=True):
        svg.append(f'<text x="{x}" y="82" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#333">{heading}</text>')
    for index, (row, color) in enumerate(zip(rows, colors, strict=True)):
        y = 135 + index * 72
        components = row["at_fermi_probe"]
        values = [components["defect_minus_host_eV"], components["atomic_reservoir_eV"], components["electron_reservoir_eV"], components["finite_size_scheme_total_eV"], components["formation_energy_eV"]]
        svg.append(f'<text x="34" y="{y+5}" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="{color}">{row["state"]}</text>')
        svg.append(f'<line x1="82" y1="{y}" x2="900" y2="{y}" stroke="#e5e5e5"/>')
        for x, value in zip(x_positions, values, strict=True):
            svg.append(f'<circle cx="{x}" cy="{y}" r="25" fill="{color}" fill-opacity="0.11" stroke="{color}"/>')
            svg.append(f'<text x="{x}" y="{y+5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#222">{value:+.2f}</text>')
        for left, right in zip(x_positions[:-1], x_positions[1:], strict=True):
            svg.append(f'<text x="{(left+right)/2}" y="{y+5}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#777">+</text>')
    svg.extend([
        '<text x="70" y="438" font-family="Arial,sans-serif" font-size="13" fill="#444">Invented B-rich teaching fixture; values in eV per defect supercell. Δn(B) = −1 for every row.</text>',
        '<text x="70" y="465" font-family="Arial,sans-serif" font-size="12" fill="#666">Original deterministic diagram from defect_formation_ledger.py; no DFT or real defect data.</text>',
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
