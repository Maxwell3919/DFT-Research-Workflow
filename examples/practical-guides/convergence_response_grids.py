from __future__ import annotations

import json


def analyse_response_grid_table() -> dict[str, object]:
    """Analyse a synthetic coarse-q/fine-integration convergence table."""
    rows = [
        {"coarse_q": 2, "fine_grid": 12, "observable": 0.52, "direct_interp_error": 1.20, "state": "response-A"},
        {"coarse_q": 2, "fine_grid": 24, "observable": 0.55, "direct_interp_error": 1.20, "state": "response-A"},
        {"coarse_q": 2, "fine_grid": 48, "observable": 0.56, "direct_interp_error": 1.20, "state": "response-A"},
        {"coarse_q": 4, "fine_grid": 12, "observable": 0.60, "direct_interp_error": 0.32, "state": "response-A"},
        {"coarse_q": 4, "fine_grid": 24, "observable": 0.62, "direct_interp_error": 0.32, "state": "response-A"},
        {"coarse_q": 4, "fine_grid": 48, "observable": 0.625, "direct_interp_error": 0.32, "state": "response-A"},
        {"coarse_q": 6, "fine_grid": 12, "observable": 0.628, "direct_interp_error": 0.08, "state": "response-A"},
        {"coarse_q": 6, "fine_grid": 24, "observable": 0.634, "direct_interp_error": 0.08, "state": "response-A"},
        {"coarse_q": 6, "fine_grid": 48, "observable": 0.636, "direct_interp_error": 0.08, "state": "response-A"},
        {"coarse_q": 8, "fine_grid": 12, "observable": 0.631, "direct_interp_error": 0.04, "state": "response-A"},
        {"coarse_q": 8, "fine_grid": 24, "observable": 0.636, "direct_interp_error": 0.04, "state": "response-A"},
        {"coarse_q": 8, "fine_grid": 48, "observable": 0.638, "direct_interp_error": 0.04, "state": "response-A"},
    ]
    reference = next(row for row in rows if row["coarse_q"] == 8 and row["fine_grid"] == 48)
    tolerances = {"observable": 0.006, "direct_interp_error": 0.10}

    coarse_values = sorted({row["coarse_q"] for row in rows})
    fine_values = sorted({row["fine_grid"] for row in rows})
    assert len(coarse_values) >= 3
    assert len({row["state"] for row in rows}) == 1
    for coarse in coarse_values:
        assert len([row for row in rows if row["coarse_q"] == coarse]) >= 2

    stable = []
    for row in rows:
        observable_deviation = abs(float(row["observable"]) - float(reference["observable"]))
        if observable_deviation <= tolerances["observable"] and row["direct_interp_error"] <= tolerances["direct_interp_error"]:
            stable.append({**row, "observable_deviation": observable_deviation})

    accepted = next(row for row in stable if row["coarse_q"] == 6 and row["fine_grid"] == 24)
    fine_check = next(row for row in stable if row["coarse_q"] == 6 and row["fine_grid"] == 48)
    coarse_check = next(row for row in stable if row["coarse_q"] == 8 and row["fine_grid"] == 24)
    strictest = next(row for row in stable if row["coarse_q"] == 8 and row["fine_grid"] == 48)

    assert fine_check["fine_grid"] > accepted["fine_grid"]
    assert coarse_check["coarse_q"] > accepted["coarse_q"]
    assert strictest["coarse_q"] > accepted["coarse_q"] and strictest["fine_grid"] > accepted["fine_grid"]

    inadequate_coarse = [row for row in rows if row["coarse_q"] == 4]
    assert abs(inadequate_coarse[-1]["observable"] - inadequate_coarse[-2]["observable"]) <= tolerances["observable"]
    assert inadequate_coarse[-1]["direct_interp_error"] > tolerances["direct_interp_error"]

    return {
        "data_origin": "synthetic illustrative response-grid table",
        "coarse_q_values": coarse_values,
        "fine_grid_values": fine_values,
        "tolerances": tolerances,
        "accepted_pairs": [
            {"coarse_q": row["coarse_q"], "fine_grid": row["fine_grid"]}
            for row in stable
        ],
        "accepted_pair": {"coarse_q": accepted["coarse_q"], "fine_grid": accepted["fine_grid"]},
        "coarse_confirmation": {"coarse_q": coarse_check["coarse_q"], "fine_grid": coarse_check["fine_grid"]},
        "fine_confirmation": {"coarse_q": fine_check["coarse_q"], "fine_grid": fine_check["fine_grid"]},
        "smooth_but_inadequate_interpolation_detected": True,
        "boundary": "analysis logic only; no DFPT solve, phonon, q mesh, interpolation, or electron-phonon observable is converged",
    }


def run() -> dict[str, object]:
    return analyse_response_grid_table()


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
