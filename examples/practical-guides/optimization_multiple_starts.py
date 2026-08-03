from __future__ import annotations

import json


def energy(x: float) -> float:
    """Tilted double-well teaching potential."""
    return (x * x - 1.0) ** 2 + 0.15 * x


def gradient(x: float) -> float:
    return 4.0 * x * (x * x - 1.0) + 0.15


def minimize(start: float) -> dict[str, object]:
    x = float(start)
    for step in range(1, 2001):
        grad = gradient(x)
        if abs(grad) < 1.0e-10:
            break
        proposed = -0.05 * grad
        bounded_step = max(-0.10, min(0.10, proposed))
        x += bounded_step
    else:
        raise RuntimeError(f"fixture minimizer did not converge from {start}")

    label = "left" if x < 0.0 else "right"
    return {
        "start": start,
        "final_coordinate": round(x, 10),
        "final_gradient": round(gradient(x), 12),
        "final_energy": round(energy(x), 10),
        "steps": step,
        "minimum_label": label,
    }


def run() -> dict[str, object]:
    starts = [-1.6, -0.4, 0.4, 1.6]
    results = [minimize(start) for start in starts]
    labels = {str(result["minimum_label"]) for result in results}
    grouped: dict[str, list[dict[str, object]]] = {}
    for result in results:
        grouped.setdefault(str(result["minimum_label"]), []).append(result)

    basin_energies = {
        label: min(float(result["final_energy"]) for result in members)
        for label, members in grouped.items()
    }
    lowest_label = min(basin_energies, key=basin_energies.get)

    assert labels == {"left", "right"}
    assert len(grouped["left"]) == 2
    assert len(grouped["right"]) == 2
    assert all(abs(float(result["final_gradient"])) < 1.0e-8 for result in results)
    assert lowest_label == "left"

    return {
        "potential": "(x^2 - 1)^2 + 0.15 x",
        "starts": results,
        "basins_retained": sorted(labels),
        "basin_energies": basin_energies,
        "lowest_fixture_basin": lowest_label,
        "local_minima_found": len(labels),
        "boundary": (
            "deterministic one-dimensional teaching potential only; no DFT calculation, "
            "material search, global-optimality proof, or stability claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
