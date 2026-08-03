"""Fit invented energy-volume data and expose fit-form and window sensitivity."""

from __future__ import annotations

from ase.eos import EquationOfState
from ase.units import GPa


VOLUMES = [34.0, 35.5, 37.0, 38.5, 40.0, 41.5, 43.0, 44.5, 46.0]
PERTURBATIONS = [0.00025, -0.00010, 0.00005, -0.00018, 0.00008, 0.00015, -0.00004, 0.00012, -0.00022]


def birch_murnaghan_energy(volume: float, e0: float, v0: float, b0: float, b0_prime: float) -> float:
    x = (v0 / volume) ** (2.0 / 3.0)
    strain = x - 1.0
    return e0 + 9.0 * v0 * b0 / 16.0 * (b0_prime * strain**3 + strain**2 * (6.0 - 4.0 * x))


def fit(volumes: list[float], energies: list[float], form: str) -> dict[str, float | str]:
    v0, e0, b0 = EquationOfState(volumes, energies, eos=form).fit()
    return {
        "form": form,
        "volume_window": [min(volumes), max(volumes)],
        "points": len(volumes),
        "v0_angstrom3_per_cell": round(float(v0), 6),
        "e0_ev_per_cell": round(float(e0), 8),
        "bulk_modulus_ev_per_angstrom3": round(float(b0), 8),
        "bulk_modulus_gpa": round(float(b0 / GPa), 4),
    }


def run() -> dict[str, object]:
    generating_parameters = {"e0": -20.0, "v0": 40.0, "b0": 0.62, "b0_prime": 4.2}
    energies = [
        birch_murnaghan_energy(volume, **generating_parameters) + perturbation
        for volume, perturbation in zip(VOLUMES, PERTURBATIONS, strict=True)
    ]
    full_fits = [fit(VOLUMES, energies, form) for form in ["birchmurnaghan", "murnaghan", "vinet"]]
    narrow_fits = [fit(VOLUMES[2:-2], energies[2:-2], form) for form in ["birchmurnaghan", "murnaghan", "vinet"]]

    for result in full_fits + narrow_fits:
        assert 39.8 < result["v0_angstrom3_per_cell"] < 40.2
        assert 80.0 < result["bulk_modulus_gpa"] < 120.0
    v0_spread = max(result["v0_angstrom3_per_cell"] for result in full_fits) - min(
        result["v0_angstrom3_per_cell"] for result in full_fits
    )
    bulk_spread = max(result["bulk_modulus_gpa"] for result in full_fits) - min(
        result["bulk_modulus_gpa"] for result in full_fits
    )
    assert v0_spread > 0.0 and bulk_spread > 0.0

    return {
        "fixture": "synthetic Birch-Murnaghan energy-volume data with invented deterministic perturbations",
        "units": {"volume": "angstrom^3 per A2B2 cell", "energy": "eV per A2B2 cell", "bulk_modulus": ["eV/angstrom^3", "GPa"]},
        "generating_parameters": generating_parameters,
        "full_window_fits": full_fits,
        "narrow_window_fits": narrow_fits,
        "full_window_model_spread": {
            "v0_angstrom3": round(v0_spread, 8),
            "bulk_modulus_gpa": round(bulk_spread, 5),
        },
        "interpretation": "different analytic forms and fit windows return similar but non-identical parameters even for one controlled fixture",
        "boundary": "fit and unit-conversion logic only; no DFT energy, converged sampling range, material EOS, pressure calibration, or physical bulk modulus",
    }


if __name__ == "__main__":
    print(run())
