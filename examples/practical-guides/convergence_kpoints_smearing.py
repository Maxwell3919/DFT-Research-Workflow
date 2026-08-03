from __future__ import annotations

import json


def analyse_k_smearing_matrix() -> dict[str, object]:
    """Analyse a synthetic mesh-by-smearing convergence matrix."""
    rows = [
        {"mesh": 6, "smearing": 0.020, "delta_e": 0.041, "dos_probe": 1.31, "state": "metal-A"},
        {"mesh": 6, "smearing": 0.010, "delta_e": 0.033, "dos_probe": 1.43, "state": "metal-A"},
        {"mesh": 6, "smearing": 0.005, "delta_e": 0.029, "dos_probe": 1.55, "state": "metal-A"},
        {"mesh": 8, "smearing": 0.020, "delta_e": 0.025, "dos_probe": 1.39, "state": "metal-A"},
        {"mesh": 8, "smearing": 0.010, "delta_e": 0.019, "dos_probe": 1.49, "state": "metal-A"},
        {"mesh": 8, "smearing": 0.005, "delta_e": 0.016, "dos_probe": 1.58, "state": "metal-A"},
        {"mesh": 10, "smearing": 0.020, "delta_e": 0.018, "dos_probe": 1.44, "state": "metal-A"},
        {"mesh": 10, "smearing": 0.010, "delta_e": 0.013, "dos_probe": 1.54, "state": "metal-A"},
        {"mesh": 10, "smearing": 0.005, "delta_e": 0.011, "dos_probe": 1.60, "state": "metal-A"},
        {"mesh": 12, "smearing": 0.020, "delta_e": 0.016, "dos_probe": 1.46, "state": "metal-A"},
        {"mesh": 12, "smearing": 0.010, "delta_e": 0.012, "dos_probe": 1.56, "state": "metal-A"},
        {"mesh": 12, "smearing": 0.005, "delta_e": 0.010, "dos_probe": 1.61, "state": "metal-A"},
    ]
    reference = next(row for row in rows if row["mesh"] == 12 and row["smearing"] == 0.005)
    tolerances = {"delta_e": 0.003, "dos_probe": 0.08}

    assert len({row["state"] for row in rows}) == 1
    meshes = sorted({row["mesh"] for row in rows})
    smearings = sorted({row["smearing"] for row in rows})
    assert len(rows) == len(meshes) * len(smearings)

    stable = []
    for row in rows:
        deviations = {
            key: abs(float(row[key]) - float(reference[key]))
            for key in tolerances
        }
        if all(deviations[key] <= tolerances[key] for key in tolerances):
            stable.append({**row, "deviations": deviations})

    accepted = next(row for row in stable if row["mesh"] == 10 and row["smearing"] == 0.010)
    stricter = next(row for row in stable if row["mesh"] == 12 and row["smearing"] == 0.005)
    assert stricter["mesh"] > accepted["mesh"]
    assert stricter["smearing"] < accepted["smearing"]

    coarse_narrow = next(row for row in rows if row["mesh"] == 6 and row["smearing"] == 0.005)
    dense_broad = next(row for row in rows if row["mesh"] == 12 and row["smearing"] == 0.020)
    assert abs(coarse_narrow["delta_e"] - dense_broad["delta_e"]) < 0.02
    assert abs(coarse_narrow["dos_probe"] - dense_broad["dos_probe"]) > 0.05

    return {
        "data_origin": "synthetic illustrative k-point and smearing matrix",
        "meshes": meshes,
        "smearings": smearings,
        "tolerances": tolerances,
        "stable_window": [
            {"mesh": row["mesh"], "smearing": row["smearing"]}
            for row in stable
        ],
        "selected_point": {"mesh": accepted["mesh"], "smearing": accepted["smearing"]},
        "stricter_confirmation": {"mesh": stricter["mesh"], "smearing": stricter["smearing"]},
        "cancellation_diagnostic": "similar energies can conceal different DOS-like errors",
        "boundary": "analysis logic only; no real mesh, smearing width, temperature, or Fermi surface is converged",
    }


def run() -> dict[str, object]:
    return analyse_k_smearing_matrix()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
