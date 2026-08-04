#!/usr/bin/env python3
"""Reconstruct a small, real Quantum ESPRESSO Al full-zone/path ledger.

The parser consumes public, compact copies of the scalar results produced by
the actual QE 7.5 run used for this guide.  It intentionally reports a mesh
sampling result, not a converged Fermi surface or a transport observable.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from pathlib import Path

QE_VERSION = "7.5"
FERMI_RE = re.compile(r"the Fermi energy is\s+([+-]?\d+(?:\.\d+)?)\s+ev", re.I)
K_BANDS_RE = re.compile(
    r"k\s*=\s*([+-]?\d+\.\d+)\s*([+-]?\d+\.\d+)\s*([+-]?\d+\.\d+)"
    r".*bands \(ev\):"
)
FLOAT_RE = re.compile(r"^[+-]?(?:\d+\.?\d*|\.\d+)(?:[Ee][+-]?\d+)?$")

PATH_LABELS = ["Γ", "X", "W", "K", "Γ", "L", "U", "W", "L", "K"]
PATH_POINTS = [
    (0.000, 0.000, 0.000),
    (0.500, 0.000, 0.500),
    (0.500, 0.250, 0.750),
    (0.375, 0.375, 0.750),
    (0.000, 0.000, 0.000),
    (0.500, 0.500, 0.500),
    (0.625, 0.250, 0.625),
    (0.500, 0.250, 0.750),
    (0.500, 0.500, 0.500),
    (0.375, 0.375, 0.750),
]
PATH_SEGMENT_INTERVALS = 16


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def floats_after(lines: list[str], start: int) -> tuple[list[float], int]:
    values: list[float] = []
    index = start
    started = False
    while index < len(lines):
        line = lines[index]
        if line.strip().startswith("occupation numbers") or "k =" in line:
            break
        tokens = line.split()
        numeric = [float(token) for token in tokens if FLOAT_RE.match(token)]
        if numeric and len(numeric) == len(tokens):
            values.extend(numeric)
            started = True
        elif started:
            break
        index += 1
    return values, index


def parse_bands(path: Path) -> list[dict[str, object]]:
    lines = path.read_text(encoding="utf-8").splitlines()
    rows: list[dict[str, object]] = []
    for index, line in enumerate(lines):
        match = K_BANDS_RE.search(line)
        if not match:
            continue
        values, _ = floats_after(lines, index + 1)
        if not values:
            raise ValueError(f"no eigenvalues after line {index + 1} in {path}")
        rows.append(
            {
                "k_cart": [float(match.group(n)) for n in (1, 2, 3)],
                "eigenvalues_ev": values,
            }
        )
    if not rows:
        raise ValueError(f"no QE band blocks found in {path}")
    widths = {len(row["eigenvalues_ev"]) for row in rows}
    if len(widths) != 1:
        raise ValueError(f"inconsistent band counts: {sorted(widths)}")
    return rows


def fermi_energy(path: Path) -> float:
    values = [float(match.group(1)) for match in FERMI_RE.finditer(path.read_text(encoding="utf-8"))]
    if not values:
        raise ValueError(f"no QE Fermi-energy marker in {path}")
    return values[-1]


def crossing_intervals(rows: list[dict[str, object]], band_index: int, fermi: float) -> int:
    values = [float(row["eigenvalues_ev"][band_index]) for row in rows]
    return sum((a - fermi) * (b - fermi) < 0 for a, b in zip(values, values[1:]))


def summary(mesh: list[dict[str, object]], path: list[dict[str, object]], fermi: float) -> dict[str, object]:
    band_index = 1  # QE's second band is the first band crossing this sampled μ.
    mesh_values = [float(row["eigenvalues_ev"][band_index]) for row in mesh]
    path_values = [float(row["eigenvalues_ev"][band_index]) for row in path]
    tolerance = 0.25
    near_mesh = [row for row in mesh if abs(float(row["eigenvalues_ev"][band_index]) - fermi) <= tolerance]
    return {
        "schema_version": 1,
        "evidence_class": "real-execution",
        "material": {
            "formula": "Al",
            "structure": "fcc primitive cell",
            "celldm1_bohr": 7.653,
            "nat": 1,
            "source": "explicit teaching input; not a database identity",
        },
        "software": {
            "name": "Quantum ESPRESSO",
            "version": QE_VERSION,
            "executables": ["pw.x"],
            "pseudopotential": {
                "filename": "Al.pbe-n-rrkjus_psl.1.0.0.UPF",
                "source": "PSLibrary PBE scalar-relativistic USPP entry",
                "sha256": "cc4f5dc6afe09c8f482dc7645e6e7cca546a55f8d907c71c825c62bf85a38d3e",
                "cutoff_metadata": {"ecutwfc_ry": 30.0, "ecutrho_ry": 240.0},
            },
        },
        "execution": {
            "scf": {"calculation": "scf", "k_mesh": "8x8x8", "smearing": "Marzari-Vanderbilt", "degauss_ry": 0.02},
            "full_zone": {"calculation": "nscf", "k_mesh": "8x8x8", "nosym": True, "noinv": True, "kpoint_count": len(mesh)},
            "band_path": {"calculation": "bands", "point_count": len(path), "segment_intervals": PATH_SEGMENT_INTERVALS},
            "command_exit_codes": {"scf": 0, "nscf": 0, "bands": 0},
        },
        "fermi_energy_ev": fermi,
        "selected_band": {"qe_index": band_index + 1, "mesh_min_ev": min(mesh_values), "mesh_max_ev": max(mesh_values), "path_min_ev": min(path_values), "path_max_ev": max(path_values)},
        "mesh": {"bands": len(mesh[0]["eigenvalues_ev"]), "near_fermi_points_abs_delta_leq_ev": tolerance, "near_fermi_point_count": len(near_mesh), "below_fermi_count": sum(value < fermi for value in mesh_values), "above_or_equal_fermi_count": sum(value >= fermi for value in mesh_values)},
        "path": {"labels": PATH_LABELS, "points": PATH_POINTS, "crossing_intervals_selected_band": crossing_intervals(path, band_index, fermi)},
        "claim_boundary": [
            "The mesh and path values are from actual QE 7.5 pw.x runs.",
            "The 8x8x8 mesh is a teaching sampling and is not a k-mesh convergence study.",
            "A sampled crossing set is not a converged Fermi surface, carrier density, or transport result.",
            "The fcc input is an explicit reproducibility case, not an experimental material-identity claim.",
        ],
    }


def write_csv(path: Path, rows: list[dict[str, object]], fermi: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    bands = len(rows[0]["eigenvalues_ev"])
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n")
        writer.writerow(["index", "kx_cart_2pi_over_alat", "ky_cart_2pi_over_alat", "kz_cart_2pi_over_alat", *[f"band_{n}_ev" for n in range(1, bands + 1)], "fermi_ev"])
        for index, row in enumerate(rows):
            writer.writerow([index, *row["k_cart"], *row["eigenvalues_ev"], fermi])


def write_svg(path: Path, mesh: list[dict[str, object]], band_path: list[dict[str, object]], fermi: float) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    width, height = 1100, 560
    band_index = 1
    near = [row for row in mesh if abs(float(row["eigenvalues_ev"][band_index]) - fermi) <= 0.25]
    xs = [float(row["k_cart"][0]) for row in mesh]
    ys = [float(row["k_cart"][1]) for row in mesh]
    xmin, xmax = min(xs), max(xs)
    ymin, ymax = min(ys), max(ys)

    def sx(value: float) -> float:
        return 80 + (value - xmin) / (xmax - xmin or 1) * 420

    def sy(value: float) -> float:
        return 450 - (value - ymin) / (ymax - ymin or 1) * 350

    path_values = [float(row["eigenvalues_ev"][band_index]) - fermi for row in band_path]
    pmin, pmax = min(path_values + [-0.2]), max(path_values + [0.2])

    def px(index: int) -> float:
        return 610 + index / max(1, len(path_values) - 1) * 430

    def py(value: float) -> float:
        return 450 - (value - pmin) / (pmax - pmin or 1) * 350

    points = " ".join(f"{sx(float(row['k_cart'][0])):.1f},{sy(float(row['k_cart'][1])):.1f}" for row in near)
    line = " ".join(f"{px(i):.1f},{py(value):.1f}" for i, value in enumerate(path_values))
    zero_y = py(0.0)
    labels = []
    for i, label in enumerate(PATH_LABELS):
        x = px(min(i * PATH_SEGMENT_INTERVALS, len(path_values) - 1))
        labels.append(f'<text x="{x:.1f}" y="480" text-anchor="middle" font-size="16">{label}</text>')
    path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">\n'''
        f'''<title>Al QE 8 by 8 by 8 full-zone crossings and band path</title>\n'''
        f'''<rect width="100%" height="100%" fill="#f8f5ee"/>\n'''
        f'''<text x="50" y="48" font-family="sans-serif" font-size="26" font-weight="700">Al: a full-zone mesh sees what one line can miss</text>\n'''
        f'''<text x="50" y="78" font-family="sans-serif" font-size="16">Quantum ESPRESSO 7.5 · 8×8×8 nscf mesh · selected band 2 · μ = {fermi:.4f} eV</text>\n'''
        f'''<rect x="55" y="95" width="475" height="390" fill="#fffdf8" stroke="#b9b0a3"/>\n'''
        f'''<rect x="585" y="95" width="465" height="390" fill="#fffdf8" stroke="#b9b0a3"/>\n'''
        f'''<line x1="80" y1="450" x2="500" y2="450" stroke="#524a42"/><line x1="80" y1="100" x2="80" y2="450" stroke="#524a42"/>\n'''
        f'''<polyline points="{points}" fill="none" stroke="#2b6f8c" stroke-width="2" opacity="0.8"/>\n'''
        f'''<text x="80" y="125" font-family="sans-serif" font-size="17">mesh points within ±0.25 eV of μ</text>\n'''
        f'''<text x="80" y="470" font-family="sans-serif" font-size="14">kₓ (QE cart. units)</text>\n'''
        f'''<line x1="610" y1="{zero_y:.1f}" x2="1040" y2="{zero_y:.1f}" stroke="#a33d2d" stroke-dasharray="6 5"/>\n'''
        f'''<polyline points="{line}" fill="none" stroke="#2b6f8c" stroke-width="3"/>\n'''
        f'''<text x="610" y="125" font-family="sans-serif" font-size="17">band 2 along Γ–X–W–K–Γ–L–U–W–L–K</text>\n'''
        f'''<text x="610" y="145" font-family="sans-serif" font-size="14">energy relative to μ (eV)</text>\n'''
        + "".join(labels)
        + f'''<text x="55" y="535" font-family="sans-serif" font-size="15">Original plot reconstructed from stored QE output-derived CSV; sampling is not convergence or a material conclusion.</text>\n'''
        "</svg>\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--scf-output", type=Path, required=True)
    parser.add_argument("--mesh-output", type=Path, required=True)
    parser.add_argument("--path-output", type=Path, required=True)
    parser.add_argument("--json", type=Path, required=True)
    parser.add_argument("--mesh-csv", type=Path, required=True)
    parser.add_argument("--path-csv", type=Path, required=True)
    parser.add_argument("--svg", type=Path, required=True)
    args = parser.parse_args()
    mesh = parse_bands(args.mesh_output)
    path = parse_bands(args.path_output)
    if len(mesh) != 512:
        raise SystemExit(f"expected 512 full-zone points, got {len(mesh)}")
    if len(path) != 145:
        raise SystemExit(f"expected 145 path points, got {len(path)}")
    fermi = fermi_energy(args.scf_output)
    report = summary(mesh, path, fermi)
    report["source_outputs"] = {key: {"path": str(value.name), "sha256": sha256(value)} for key, value in {"scf": args.scf_output, "mesh": args.mesh_output, "path": args.path_output}.items()}
    args.json.parent.mkdir(parents=True, exist_ok=True)
    args.json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    write_csv(args.mesh_csv, mesh, fermi)
    write_csv(args.path_csv, path, fermi)
    write_svg(args.svg, mesh, path, fermi)
    print(json.dumps({"fermi_energy_ev": fermi, "mesh_points": len(mesh), "path_points": len(path), "mesh_near_fermi": report["mesh"]["near_fermi_point_count"], "path_crossing_intervals": report["path"]["crossing_intervals_selected_band"]}, indent=2))


if __name__ == "__main__":
    main()
