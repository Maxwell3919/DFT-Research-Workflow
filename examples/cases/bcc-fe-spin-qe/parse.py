#!/usr/bin/env python3
"""Strictly parse the declared bcc Fe QE 7.5 SCF outputs.

This parser is deliberately narrow: it accepts exactly the four candidate
outputs declared in input/candidate-set.json and refuses partial completion,
missing SCF markers, non-QE-7.5 banners, private paths, or ambiguous energies.
"""
from __future__ import annotations

import hashlib
import json
import math
import os
import re
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "input"
OUTPUT = Path(os.environ.get("CASE_OUTPUT_ROOT", ROOT / "output")).resolve()
DERIVED = ROOT / "derived"
FIGURES = ROOT / "figures"
PRIVATE_PATH = re.compile(r"/(?:home|Users)/[A-Za-z0-9._-]+/")
ENERGY = re.compile(r"^\s*!\s+total energy\s+=\s+([-+0-9.EeDd]+)\s+Ry", re.MULTILINE)
MAGNETIZATION = re.compile(r"^\s*total magnetization\s+=\s+([-+0-9.EeDd]+)\s+Bohr mag/cell", re.MULTILINE)
ABS_MAGNETIZATION = re.compile(r"^\s*absolute magnetization\s+=\s+([-+0-9.EeDd]+)\s+Bohr mag/cell", re.MULTILINE)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def qe_float(value: str) -> float:
    return float(value.replace("D", "E").replace("d", "e"))


def one_value(pattern: re.Pattern[str], text: str, label: str, path: Path) -> float:
    values = [qe_float(value) for value in pattern.findall(text)]
    if len(values) != 1:
        raise ValueError(f"{path.name}: expected exactly one {label}, found {len(values)}")
    return values[0]


def final_iteration_value(pattern: re.Pattern[str], text: str, label: str, path: Path) -> tuple[float, int]:
    """Require one or more SCF-iteration reports and select the final report."""
    values = [qe_float(value) for value in pattern.findall(text)]
    if not values:
        raise ValueError(f"{path.name}: expected at least one {label}")
    return values[-1], len(values)


def parse_candidate(record: dict[str, object]) -> dict[str, object]:
    ident = str(record["id"])
    out_path = OUTPUT / f"{ident}.out"
    err_path = OUTPUT / f"{ident}.err"
    if not out_path.is_file() or not err_path.is_file():
        raise ValueError(f"{ident}: missing separate stdout/stderr artifact")
    stdout = out_path.read_text(encoding="utf-8", errors="strict")
    stderr = err_path.read_text(encoding="utf-8", errors="strict")
    if PRIVATE_PATH.search(stdout) or PRIVATE_PATH.search(stderr):
        raise ValueError(f"{ident}: private absolute path found in output")
    if len(re.findall(r"Program\s+PWSCF\s+v\.7\.5\b", stdout)) != 1:
        raise ValueError(f"{ident}: expected exactly one QE 7.5 PWSCF banner")
    if stdout.count("JOB DONE.") != 1:
        raise ValueError(f"{ident}: expected exactly one JOB DONE marker")
    if "convergence has been achieved in" not in stdout:
        raise ValueError(f"{ident}: SCF convergence marker absent")
    lowered = (stdout + "\n" + stderr).lower()
    forbidden = ("convergence not achieved", "error in routine", "stopping ...", "segmentation fault", "floating-point exception")
    if any(marker in lowered for marker in forbidden):
        raise ValueError(f"{ident}: fatal or nonconvergence marker found")
    energy = one_value(ENERGY, stdout, "total energy", out_path)
    nspin = int(record["nspin"])
    moment_matches = MAGNETIZATION.findall(stdout)
    absolute_matches = ABS_MAGNETIZATION.findall(stdout)
    if nspin == 2:
        magnetization, magnetization_match_count = final_iteration_value(MAGNETIZATION, stdout, "total magnetization", out_path)
        absolute_magnetization, absolute_magnetization_match_count = final_iteration_value(ABS_MAGNETIZATION, stdout, "absolute magnetization", out_path)
    else:
        if moment_matches and any(abs(qe_float(v)) > 1e-7 for v in moment_matches):
            raise ValueError(f"{ident}: non-spin-polarized candidate reports nonzero magnetization")
        magnetization = 0.0 if moment_matches else None
        absolute_magnetization = 0.0 if absolute_matches else None
        magnetization_match_count = len(moment_matches)
        absolute_magnetization_match_count = len(absolute_matches)
    return {
        "id": ident,
        "candidate_family": record["candidate_family"],
        "nspin": nspin,
        "k_mesh": record["k_mesh"],
        "energy_ry_per_fe_primitive_cell": energy,
        "total_magnetization_bohr_mag_per_cell": magnetization,
        "absolute_magnetization_bohr_mag_per_cell": absolute_magnetization,
        "total_magnetization_match_count": magnetization_match_count,
        "absolute_magnetization_match_count": absolute_magnetization_match_count,
        "input_sha256": sha256(ROOT / str(record["input"])),
        "stdout_sha256": sha256(out_path),
        "stderr_sha256": sha256(err_path),
        "completion": {"job_done": True, "scf_converged": True, "qe_version": "7.5"},
    }


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def draw_line(canvas: bytearray, width: int, height: int, x0: int, y0: int, x1: int, y1: int, colour: tuple[int, int, int]) -> None:
    dx, dy = abs(x1 - x0), -abs(y1 - y0)
    sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
    error = dx + dy
    while True:
        if 0 <= x0 < width and 0 <= y0 < height:
            offset = (y0 * width + x0) * 3
            canvas[offset:offset + 3] = bytes(colour)
        if x0 == x1 and y0 == y1:
            return
        twice = 2 * error
        if twice >= dy:
            error += dy
            x0 += sx
        if twice <= dx:
            error += dx
            y0 += sy


def draw_circle(canvas: bytearray, width: int, height: int, cx: int, cy: int, radius: int, colour: tuple[int, int, int]) -> None:
    for y in range(cy - radius, cy + radius + 1):
        for x in range(cx - radius, cx + radius + 1):
            if (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2 and 0 <= x < width and 0 <= y < height:
                offset = (y * width + x) * 3
                canvas[offset:offset + 3] = bytes(colour)


def write_energy_png(rows: list[dict[str, object]], path: Path) -> None:
    width, height = 720, 420
    canvas = bytearray([255, 255, 255] * width * height)
    left, right, top, bottom = 95, 660, 45, 355
    axis = (51, 65, 85)
    draw_line(canvas, width, height, left, top, left, bottom, axis)
    draw_line(canvas, width, height, left, bottom, right, bottom, axis)
    fm_energy = next(float(row["energy_ry_per_fe_primitive_cell"]) for row in rows if row["id"] == "fm-k12")
    points = []
    for index, row in enumerate(rows):
        delta_mev = (float(row["energy_ry_per_fe_primitive_cell"]) - fm_energy) * 13605.693122994
        points.append((left + 150 + index * 250, delta_mev))
    scale_min = min(value for _, value in points)
    scale_max = max(value for _, value in points)
    span = max(scale_max - scale_min, 1.0)
    for y in range(5):
        yy = top + round((bottom - top) * y / 4)
        draw_line(canvas, width, height, left, yy, right, yy, (226, 232, 240))
    for index, (x, value) in enumerate(points):
        y = bottom - round((value - scale_min) / span * (bottom - top - 40)) - 20
        draw_line(canvas, width, height, x, bottom, x, y, (148, 163, 184))
        draw_circle(canvas, width, height, x, y, 9, (220, 38, 38) if index == 0 else (71, 85, 105))
    raw = b"".join(b"\x00" + bytes(canvas[row * width * 3:(row + 1) * width * 3]) for row in range(height))
    path.write_bytes(b"\x89PNG\r\n\x1a\n" + png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)) + png_chunk(b"IDAT", zlib.compress(raw, 9)) + png_chunk(b"IEND", b""))


def main() -> None:
    if OUTPUT != ROOT / "output" and ROOT / "output" not in OUTPUT.parents:
        raise SystemExit("FAIL CASE_OUTPUT_ROOT must stay under this case output directory")
    config = json.loads((INPUT / "candidate-set.json").read_text(encoding="utf-8"))
    plan = json.loads((INPUT / "qe_plan.json").read_text(encoding="utf-8"))
    if config["protocol_id"] != plan["scientific_protocol_id"] or plan["qe_version"] != "7.5":
        raise SystemExit("FAIL candidate-set and QE plan identity mismatch")
    status_path = OUTPUT / "run-status.json"
    if not status_path.is_file():
        raise SystemExit("FAIL missing run-status.json with the declared program exit codes")
    run_status = json.loads(status_path.read_text(encoding="utf-8"))
    expected_pseudo = json.loads((INPUT / "pseudopotential-manifest.json").read_text())["pseudopotentials"][0]["sha256"]
    if run_status.get("case_id") != config["case_id"] or run_status.get("pseudopotential_sha256") != expected_pseudo:
        raise SystemExit("FAIL run-status identity does not match the declared case and pseudopotential")
    expected_ids = [str(record["id"]) for record in config["candidates"]]
    status_rows = run_status.get("runs")
    if not isinstance(status_rows, list) or [row.get("id") for row in status_rows] != expected_ids or any(row.get("exit_code") != 0 for row in status_rows):
        raise SystemExit("FAIL run-status must record zero exit status for exactly the declared candidates")
    rows = [parse_candidate(record) for record in config["candidates"]]
    by_id = {str(row["id"]): row for row in rows}
    fm, nm = (by_id[ident] for ident in config["comparison"]["primary_pair"])
    tolerance = float(config["k_mesh_screen"]["absolute_tolerance_ry"])
    mesh_rows = [by_id[ident] for ident in config["k_mesh_screen"]["candidate_ids"]]
    changes = [abs(float(mesh_rows[index]["energy_ry_per_fe_primitive_cell"]) - float(mesh_rows[index - 1]["energy_ry_per_fe_primitive_cell"])) for index in range(1, len(mesh_rows))]
    converged = len(changes) == 2 and all(change <= tolerance for change in changes)
    energy_delta = float(nm["energy_ry_per_fe_primitive_cell"]) - float(fm["energy_ry_per_fe_primitive_cell"])
    summary = {
        "case_id": config["case_id"],
        "protocol_id": config["protocol_id"],
        "pseudopotential_sha256": json.loads((INPUT / "pseudopotential-manifest.json").read_text())["pseudopotentials"][0]["sha256"],
        "run_status_sha256": sha256(status_path),
        "candidates": rows,
        "primary_comparison": {
            "definition": config["comparison"]["energy_difference"],
            "delta_ry_per_fe_primitive_cell": energy_delta,
            "delta_mev_per_fe_primitive_cell": energy_delta * 13605.693122994,
            "fm_total_magnetization_bohr_mag_per_cell": fm["total_magnetization_bohr_mag_per_cell"],
            "nm_total_magnetization_bohr_mag_per_cell": nm["total_magnetization_bohr_mag_per_cell"],
        },
        "gates": {
            "G1": {"status": "PASS", "summary": "All four declared pw.x outputs have one QE 7.5 banner, one JOB DONE marker, and zero exit status in run-status.json."},
            "G2": {"status": "PASS", "summary": "All four declared outputs contain the SCF convergence marker and no parser-listed fatal or nonconvergence marker."},
            "G3": {"status": "PASS", "summary": "Separate stdout/stderr, strict parsed candidate records, and an original derived PNG are present."},
            "G4": {"status": "PASS" if converged else "FAIL", "summary": f"FM 8/10/12 mesh adjacent total-energy changes are {changes} Ry; tolerance is {tolerance} Ry."},
            "G5": {"status": "NOT CLAIMED", "summary": "FM/NM candidate comparison is not a complete magnetic ground-state, magnetic-order, finite-temperature, or experimental claim."},
        },
        "claim_boundary": config["comparison"]["candidate_coverage"],
    }
    attempt_id = run_status.get("attempt_id")
    if not isinstance(attempt_id, str) or not re.fullmatch(r"[a-z0-9][a-z0-9-]*", attempt_id):
        raise SystemExit("FAIL run-status has no valid attempt identifier")
    derived_root = DERIVED / attempt_id
    figures_root = FIGURES / attempt_id
    if derived_root.exists() or figures_root.exists():
        if os.environ.get("CASE_REUSE_DERIVED") != "1":
            raise SystemExit("FAIL derived attempt directory already exists; do not overwrite prior derived evidence")
        summary_path = derived_root / "bcc-fe-spin-summary.json"
        mesh_path = derived_root / "fm-kmesh-screen.json"
        figure_path = figures_root / "fm-nm-energy-comparison.png"
        if not summary_path.is_file() or not mesh_path.is_file() or not figure_path.is_file():
            raise SystemExit("FAIL existing derived attempt is incomplete")
        existing = json.loads(summary_path.read_text(encoding="utf-8"))
        if existing.get("run_status_sha256") != sha256(status_path):
            raise SystemExit("FAIL existing derived attempt does not bind to this run-status artifact")
        print(json.dumps({"status": existing["gates"]["G4"]["status"], "delta_ry": existing["primary_comparison"]["delta_ry_per_fe_primitive_cell"], "fm_magnetization": existing["primary_comparison"]["fm_total_magnetization_bohr_mag_per_cell"], "reuse": True}, sort_keys=True))
        return
    derived_root.mkdir(parents=True)
    figures_root.mkdir(parents=True)
    (derived_root / "bcc-fe-spin-summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    mesh = {"candidate_ids": config["k_mesh_screen"]["candidate_ids"], "adjacent_energy_changes_ry": changes, "tolerance_ry": tolerance, "status": "PASS" if converged else "FAIL", "boundary": config["k_mesh_screen"]["criterion"]}
    (derived_root / "fm-kmesh-screen.json").write_text(json.dumps(mesh, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    write_energy_png([fm, nm], figures_root / "fm-nm-energy-comparison.png")
    print(json.dumps({"status": "PASS" if converged else "FAIL", "delta_ry": energy_delta, "fm_magnetization": fm["total_magnetization_bohr_mag_per_cell"], "kmesh_changes_ry": changes}, sort_keys=True))


if __name__ == "__main__":
    main()
