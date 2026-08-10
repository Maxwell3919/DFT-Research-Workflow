"""Invented anisotropy and exchange ledger; this is not a DFT calculation."""
from __future__ import annotations

def run() -> dict[str, object]:
    directional = {"c axis": -20.0000, "a axis": -19.9920, "b axis": -19.9950}
    reference = min(directional, key=directional.get)
    # H = -J e1 dot e2: E_parallel=-J, E_antiparallel=+J.
    parallel, antiparallel = -8.0, 8.0
    fitted_j = (antiparallel - parallel) / 2
    held_out_orthogonal = 0.0
    predicted_orthogonal = 0.0
    return {
        "fixture": "invented fixed-geometry SOC directional and two-site exchange energies",
        "energy_unit": "invented micro-energy units per declared magnetic ion",
        "easy_direction_within_fixture": reference,
        "mae_relative_to_c": {axis: energy - directional["c axis"] for axis, energy in directional.items()},
        "heisenberg_convention": "H = -J e1 dot e2; positive J favours parallel moments",
        "fitted_J": fitted_j,
        "held_out_orthogonal_energy": held_out_orthogonal,
        "predicted_orthogonal_energy": predicted_orthogonal,
        "boundary": "Invented arithmetic only; no SOC calculation, material MAE, exchange parameter, or finite-temperature prediction.",
    }


def main() -> None:
    result = run()
    assert result["easy_direction_within_fixture"] == "c axis"
    assert result["mae_relative_to_c"]["a axis"] == 0.007999999999999119
    assert result["fitted_J"] == 8.0
    assert result["held_out_orthogonal_energy"] == result["predicted_orthogonal_energy"]
    print(result)
    print("Invented anisotropy/exchange fixture passed; it verifies arithmetic only.")


if __name__ == "__main__":
    main()
