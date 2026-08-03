"""Compare two invented phases by minimizing enthalpy at common pressure."""

from __future__ import annotations

from ase.units import GPa


PHASES = {
    "alpha": {"e0": 0.0, "v0": 40.0, "bulk_modulus": 0.70},
    "beta": {"e0": 0.08, "v0": 35.0, "bulk_modulus": 0.80},
}


def equilibrium_at_pressure(phase: dict[str, float], pressure_gpa: float) -> dict[str, float]:
    pressure = pressure_gpa * GPa
    volume = phase["v0"] * (1.0 - pressure / phase["bulk_modulus"])
    energy = phase["e0"] + phase["bulk_modulus"] * (volume - phase["v0"]) ** 2 / (2.0 * phase["v0"])
    enthalpy = energy + pressure * volume
    return {"volume": volume, "energy": energy, "pv": pressure * volume, "enthalpy": enthalpy}


def enthalpy_difference(pressure_gpa: float) -> float:
    return equilibrium_at_pressure(PHASES["beta"], pressure_gpa)["enthalpy"] - equilibrium_at_pressure(
        PHASES["alpha"], pressure_gpa
    )["enthalpy"]


def find_crossing(lower: float, upper: float) -> float:
    assert enthalpy_difference(lower) * enthalpy_difference(upper) < 0.0
    for _ in range(80):
        middle = (lower + upper) / 2.0
        if enthalpy_difference(lower) * enthalpy_difference(middle) <= 0.0:
            upper = middle
        else:
            lower = middle
    return (lower + upper) / 2.0


def run() -> dict[str, object]:
    crossing = find_crossing(0.0, 10.0)
    samples = {}
    for pressure in [0.0, crossing, 6.0]:
        alpha = equilibrium_at_pressure(PHASES["alpha"], pressure)
        beta = equilibrium_at_pressure(PHASES["beta"], pressure)
        samples[f"{pressure:.6f}_GPa"] = {
            "alpha": {key: round(value, 8) for key, value in alpha.items()},
            "beta": {key: round(value, 8) for key, value in beta.items()},
            "beta_minus_alpha_enthalpy_ev": round(beta["enthalpy"] - alpha["enthalpy"], 10),
        }

    assert enthalpy_difference(0.0) > 0.0
    assert abs(enthalpy_difference(crossing)) < 1e-12
    assert enthalpy_difference(6.0) < 0.0

    return {
        "fixture": "two analytic quadratic phase branches with invented parameters; no material data",
        "phase_parameters": PHASES,
        "pressure_conversion": {"ase_GPa_in_eV_per_angstrom3": GPa},
        "crossing_pressure_gpa": round(crossing, 8),
        "common_pressure_samples": samples,
        "interpretation": "alpha is lower at zero pressure; the denser beta branch becomes lower in enthalpy above the fixture crossing",
        "boundary": "common-pressure enthalpy minimization only; no DFT calculation, kinetic path, coexistence range, mechanical or dynamical stability, finite-temperature boundary, or real phase transition",
    }


if __name__ == "__main__":
    print(run())
