from __future__ import annotations

import argparse
import json
from pathlib import Path


def adsorption_energy(combined: float, clean_slab: float, reference: float, count: int = 1) -> float:
    if count <= 0:
        raise ValueError("adsorbate count must be positive")
    return (combined - clean_slab - reference) / count


def run() -> dict[str, object]:
    molecular = {
        "reaction": "CO(g) + * -> CO*",
        "combined_eV": -514.800,
        "clean_slab_eV": -500.000,
        "reference_eV": -14.000,
        "count": 1,
    }
    molecular["adsorption_energy_eV_per_CO"] = adsorption_energy(
        molecular["combined_eV"], molecular["clean_slab_eV"], molecular["reference_eV"]
    )

    dissociative = {
        "reaction": "H2(g) + 2* -> 2H*",
        "combined_eV": -507.400,
        "clean_slab_eV": -500.000,
        "reference_eV": -6.800,
        "count": 2,
    }
    dissociative["adsorption_energy_eV_per_H"] = adsorption_energy(
        dissociative["combined_eV"],
        dissociative["clean_slab_eV"],
        dissociative["reference_eV"],
        dissociative["count"],
    )

    one_adsorbate = molecular["combined_eV"]
    two_adsorbates = -529.200
    average_two = adsorption_energy(two_adsorbates, molecular["clean_slab_eV"], 2 * molecular["reference_eV"], 2)
    differential_second = two_adsorbates - one_adsorbate - molecular["reference_eV"]

    free_energy_terms = {
        "static_electronic_eV": molecular["adsorption_energy_eV_per_CO"],
        "zero_point_change_eV": 0.100,
        "thermal_enthalpy_change_eV": 0.030,
        "minus_T_delta_S_eV": 0.550,
        "declared_environment_change_eV": -0.070,
    }
    free_energy = sum(free_energy_terms.values())

    assert abs(molecular["adsorption_energy_eV_per_CO"] + 0.8) < 1e-12
    assert abs(dissociative["adsorption_energy_eV_per_H"] + 0.3) < 1e-12
    assert abs(average_two + 0.6) < 1e-12
    assert abs(differential_second + 0.4) < 1e-12
    assert abs(free_energy + 0.19) < 1e-12

    return {
        "fixture_type": "deterministic adsorption-energy and free-energy ledger",
        "sign_convention": "products minus reactants; negative is favourable for the written reaction",
        "molecular_adsorption": molecular,
        "dissociative_adsorption": dissociative,
        "coverage_ledger": {
            "average_for_two_eV_per_CO": average_two,
            "differential_second_CO_eV": differential_second,
        },
        "illustrative_free_energy": {
            "terms": free_energy_terms,
            "sum_eV_per_CO": free_energy,
            "standard_state": "invented teaching fixture; not a material or operating condition",
        },
        "evidence_boundary": "Arithmetic and normalization are verified for invented numbers. No electronic-structure or thermodynamic calculation was run.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    molecular = report["molecular_adsorption"]
    coverage = report["coverage_ledger"]
    free_energy = report["illustrative_free_energy"]
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="560" viewBox="0 0 1000 560" role="img" aria-labelledby="title desc">',
        '<title id="title">Adsorption-energy ledger from compatible terms</title>',
        '<desc id="desc">Conceptual ledger showing a molecular adsorption subtraction, average versus differential coverage energies, and additive free-energy terms made from invented values.</desc>',
        '<rect width="1000" height="560" fill="#f8f5ee"/>',
        '<text x="55" y="48" font-family="sans-serif" font-size="26" font-weight="700" fill="#172a3a">One reaction, one sign convention, every term visible</text>',
        '<rect x="55" y="85" width="890" height="120" rx="14" fill="#e7eef1" stroke="#78909c"/>',
        '<text x="80" y="118" font-family="sans-serif" font-size="18" font-weight="700" fill="#243746">CO(g) + * → CO*</text>',
        f'<text x="80" y="153" font-family="monospace" font-size="18" fill="#243746">{molecular["combined_eV"]:.3f} - ({molecular["clean_slab_eV"]:.3f}) - ({molecular["reference_eV"]:.3f})</text>',
        f'<text x="80" y="187" font-family="sans-serif" font-size="20" fill="#a33d2d">E_ads = {molecular["adsorption_energy_eV_per_CO"]:.2f} eV per CO</text>',
        '<text x="690" y="153" font-family="sans-serif" font-size="15" fill="#52616b">products − reactants</text>',
        '<text x="690" y="181" font-family="sans-serif" font-size="15" fill="#52616b">negative = favourable here</text>',
        '<rect x="55" y="235" width="420" height="155" rx="14" fill="#fff" stroke="#9aa8af"/>',
        '<text x="80" y="270" font-family="sans-serif" font-size="18" font-weight="700" fill="#243746">Coverage changes the question</text>',
        f'<text x="80" y="310" font-family="sans-serif" font-size="18" fill="#2b6f8c">average at N=2: {coverage["average_for_two_eV_per_CO"]:.2f} eV / CO</text>',
        f'<text x="80" y="346" font-family="sans-serif" font-size="18" fill="#d45b45">second addition: {coverage["differential_second_CO_eV"]:.2f} eV</text>',
        '<text x="80" y="374" font-family="sans-serif" font-size="14" fill="#52616b">same invented totals, different normalization</text>',
        '<rect x="525" y="235" width="420" height="155" rx="14" fill="#fff" stroke="#9aa8af"/>',
        '<text x="550" y="270" font-family="sans-serif" font-size="18" font-weight="700" fill="#243746">Static energy → illustrative ΔG</text>',
        '<text x="550" y="307" font-family="sans-serif" font-size="16" fill="#52616b">ΔE + ZPE + thermal − TΔS + environment</text>',
        f'<text x="550" y="348" font-family="sans-serif" font-size="24" fill="#704c8a">{free_energy["sum_eV_per_CO"]:.2f} eV per CO</text>',
        '<text x="550" y="376" font-family="sans-serif" font-size="14" fill="#52616b">all correction terms are invented teaching values</text>',
        '<path d="M500 416 L500 468" stroke="#70808a" stroke-width="3" marker-end="url(#arrow)"/>',
        '<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="#70808a"/></marker></defs>',
        '<text x="500" y="505" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="700" fill="#243746">Comparable terms support a conditional result</text>',
        '<text x="500" y="535" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">Deterministic fixture · no DFT, adsorption experiment, or thermodynamic sampling</text>',
        '</svg>',
    ]
    target.write_text("".join(parts), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    if args.svg:
        render_svg(result, args.svg)
    print(json.dumps(result, indent=2))
