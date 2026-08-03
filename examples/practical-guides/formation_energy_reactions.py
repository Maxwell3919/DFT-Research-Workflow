from __future__ import annotations

from fractions import Fraction


def balance(compositions: dict[str, dict[str, int]], coefficients: dict[str, Fraction]) -> dict[str, Fraction]:
    elements = sorted({element for composition in compositions.values() for element in composition})
    return {
        element: sum(coefficients[species] * compositions[species].get(element, 0) for species in coefficients)
        for element in elements
    }


def reaction_energy(energies: dict[str, Fraction], coefficients: dict[str, Fraction]) -> Fraction:
    return sum(coefficients[species] * energies[species] for species in coefficients)


def run() -> dict[str, object]:
    """Evaluate two exactly balanced deterministic reference reactions."""

    compositions = {
        "A": {"A": 1},
        "B2": {"B": 2},
        "AB": {"A": 1, "B": 1},
        "A2B3": {"A": 2, "B": 3},
    }
    energies = {
        "A": Fraction(-3, 1),
        "B2": Fraction(-8, 1),
        "AB": Fraction(-36, 5),
        "A2B3": Fraction(-37, 2),
    }
    elemental = {
        "A": Fraction(-2, 1),
        "B2": Fraction(-3, 2),
        "A2B3": Fraction(1, 1),
    }
    compound_reservoir = {
        "AB": Fraction(-2, 1),
        "B2": Fraction(-1, 2),
        "A2B3": Fraction(1, 1),
    }

    elemental_balance = balance(compositions, elemental)
    compound_balance = balance(compositions, compound_reservoir)
    assert elemental_balance == {"A": 0, "B": 0}
    assert compound_balance == {"A": 0, "B": 0}

    elemental_energy = reaction_energy(energies, elemental)
    compound_energy = reaction_energy(energies, compound_reservoir)
    assert elemental_energy == Fraction(-1, 2)
    assert compound_energy == Fraction(-1, 10)

    atoms_per_formula = 5
    return {
        "fixture": "abstract A/B energy table with invented exact rational values; no material data",
        "energy_units": "eV per listed calculation object",
        "elemental_formation_reaction": {
            "equation": "2 A + 3/2 B2 -> A2B3",
            "balance": {key: int(value) for key, value in elemental_balance.items()},
            "delta_ev_per_formula_unit": float(elemental_energy),
            "delta_ev_per_atom": float(elemental_energy / atoms_per_formula),
        },
        "compound_reservoir_reaction": {
            "equation": "2 AB + 1/2 B2 -> A2B3",
            "balance": {key: int(value) for key, value in compound_balance.items()},
            "delta_ev_per_formula_unit": float(compound_energy),
            "delta_ev_per_atom": float(compound_energy / atoms_per_formula),
        },
        "interpretation": (
            "the two negative fixture values refer to different balanced reservoirs; neither tests all competing phases"
        ),
        "boundary": (
            "stoichiometric and normalization arithmetic only; no DFT execution, reference accuracy, "
            "finite-temperature thermodynamics, convex hull, phase stability, or synthesizability claim"
        ),
    }


if __name__ == "__main__":
    print(run())
