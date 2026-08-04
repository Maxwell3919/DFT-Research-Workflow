"""Deterministic invented path-energy ledger; it does not run NEB or DFT."""
from __future__ import annotations

from pathlib import Path


def run(svg: str | None = None) -> dict:
    labels = ["reactant", "image 1", "candidate peak", "image 3", "product"]
    relative_energy_ev = [0.0, 0.18, 0.43, 0.27, -0.06]
    peak = max(range(len(relative_energy_ev)), key=relative_energy_ev.__getitem__)
    result = {"fixture": "invented path-energy rows", "labels": labels, "relative_energy_ev": relative_energy_ev, "candidate_peak": labels[peak], "forward_barrier_ev": relative_energy_ev[peak] - relative_energy_ev[0], "reverse_barrier_ev": relative_energy_ev[peak] - relative_energy_ev[-1], "does_not_establish": "a NEB path, saddle point, Hessian, rate, material mechanism, or scientific conclusion"}
    if svg:
        Path(svg).write_text("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"720\" height=\"220\" viewBox=\"0 0 720 220\"><title>Invented path-energy ledger</title><rect width=\"720\" height=\"220\" fill=\"white\"/><path d=\"M70 165 L210 110 L360 45 L510 84 L650 183\" fill=\"none\" stroke=\"#14532d\" stroke-width=\"5\"/><path d=\"M70 183H650\" stroke=\"#475569\"/><text x=\"55\" y=\"205\" font-family=\"sans-serif\" font-size=\"16\">invented coordinate</text><text x=\"370\" y=\"35\" font-family=\"sans-serif\" font-size=\"16\">candidate peak: 0.43 eV</text><text x=\"75\" y=\"155\" font-family=\"sans-serif\" font-size=\"14\">reactant</text><text x=\"575\" y=\"175\" font-family=\"sans-serif\" font-size=\"14\">product</text></svg>\n", encoding="utf-8")
    return result


if __name__ == "__main__":
    print(run())
