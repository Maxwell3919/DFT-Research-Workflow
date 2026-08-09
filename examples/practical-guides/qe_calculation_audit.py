"""Audit the committed adverse bcc-Fe QE case without modifying its evidence."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "examples/cases/bcc-fe-spin-qe"
ATTEMPT_01 = CASE / "output/attempt-01-slurm-launch-failure"
ATTEMPT_02 = CASE / "output/attempt-02-pmix"
DERIVED = CASE / "derived/attempt-02-pmix"
ENERGY = re.compile(r"!\s+total energy\s+=\s+([-+0-9.Ee]+)\s+Ry")
FERMI = re.compile(r"the Fermi energy is\s+([-+0-9.Ee]+)\s+ev", re.IGNORECASE)
TOTAL_FORCE = re.compile(r"Total force\s*=\s*([-+0-9.Ee]+)")
PRESSURE = re.compile(r"total\s+stress.*?P=\s*([-+0-9.Ee]+)", re.IGNORECASE)
SCF_ITERATIONS = re.compile(
    r"convergence has been achieved in\s+(\d+)\s+iterations", re.IGNORECASE
)
ADVERSE_LINE = re.compile(
    r"\bwarning\b|error in routine|convergence NOT achieved|no convergence has been achieved|"
    r"segmentation fault|out of memory|oom-kill|killed by signal",
    re.IGNORECASE,
)


def _load_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _verify_artifacts(manifest: dict[str, object]) -> dict[str, object]:
    verified: list[str] = []
    for artifact in manifest["artifacts"]:
        path = CASE / artifact["path"]
        data = path.read_bytes()
        assert len(data) == artifact["bytes"], f"size mismatch: {artifact['path']}"
        assert hashlib.sha256(data).hexdigest() == artifact["sha256"], (
            f"SHA-256 mismatch: {artifact['path']}"
        )
        verified.append(artifact["path"])
    return {
        "status": "PASS",
        "artifact_count": len(verified),
        "all_manifest_sizes_and_sha256_match": True,
    }


def _input_coordinates(path: Path) -> dict[str, object]:
    lines = path.read_text(encoding="utf-8").splitlines()
    header_index = next(i for i, line in enumerate(lines) if line.startswith("ATOMIC_POSITIONS"))
    units = lines[header_index].split(maxsplit=1)[1]
    atoms: list[dict[str, object]] = []
    for line in lines[header_index + 1 :]:
        fields = line.split()
        if len(fields) < 4 or not re.fullmatch(r"[A-Z][a-z]?", fields[0]):
            break
        atoms.append({"symbol": fields[0], "coordinates": [float(value) for value in fields[1:4]]})
    assert atoms, f"no coordinates parsed: {path.name}"
    return {"units": units, "atoms": atoms}


def _output_audit(run_id: str, expected: dict[str, object]) -> dict[str, object]:
    stdout = ATTEMPT_02 / f"{run_id}.out"
    stderr = ATTEMPT_02 / f"{run_id}.err"
    text = stdout.read_text(encoding="utf-8")
    energies = ENERGY.findall(text)
    fermi = FERMI.findall(text)
    forces = TOTAL_FORCE.findall(text)
    pressure = PRESSURE.findall(text)
    scf_iterations = SCF_ITERATIONS.findall(text)
    adverse_lines = [line.strip() for line in text.splitlines() if ADVERSE_LINE.search(line)]
    assert text.count("Program PWSCF v.7.5") == 1
    assert text.count("JOB DONE.") == 1
    assert "convergence has been achieved" in text
    assert energies and fermi and forces and scf_iterations, f"missing SCF audit field: {run_id}"
    assert abs(float(energies[-1]) - expected["energy_ry_per_fe_primitive_cell"]) < 1.0e-10
    assert _sha256(stdout) == expected["stdout_sha256"]
    assert _sha256(stderr) == expected["stderr_sha256"]
    return {
        "run_id": run_id,
        "termination": {"pwscf_banner_count": 1, "job_done_count": 1, "recorded_exit_code": 0},
        "scf": {"convergence_marker": True, "iterations": int(scf_iterations[-1])},
        "energy_ry_per_fe_primitive_cell": float(energies[-1]),
        "fermi_energy_ev": float(fermi[-1]),
        "total_force_ry_per_bohr": float(forces[-1]),
        "stress": {
            "reported": "total   stress" in text,
            "pressure_kbar": float(pressure[-1]) if pressure else None,
        },
        "input_coordinates": _input_coordinates(CASE / "input" / f"{run_id}.scf.in"),
        "warning_or_fatal_lines": adverse_lines,
        "stdout_sha256": _sha256(stdout),
        "stderr_bytes": stderr.stat().st_size,
    }


def run() -> dict[str, object]:
    manifest = _load_json(CASE / "manifest.json")
    failure = _load_json(ATTEMPT_01 / "failure-manifest.json")
    run_status = _load_json(ATTEMPT_02 / "run-status.json")
    summary = _load_json(DERIVED / "bcc-fe-spin-summary.json")
    mesh = _load_json(DERIVED / "fm-kmesh-screen.json")
    environment = dict(
        line.split("=", 1)
        for line in (CASE / "environment.txt").read_text(encoding="utf-8").splitlines()
        if "=" in line
    )

    assert manifest["case_id"] == summary["case_id"] == run_status["case_id"] == "bcc-fe-spin-qe"
    assert manifest["exit_code"] == 1 and manifest["completed_at"] is None
    artifact_integrity = _verify_artifacts(manifest)

    attempt_01_stdout = ATTEMPT_01 / "fm-k8.out"
    attempt_01_stderr = ATTEMPT_01 / "fm-k8.err"
    assert attempt_01_stdout.stat().st_size == 0
    assert "MPI_Init" in attempt_01_stderr.read_text(encoding="utf-8")
    assert failure["status"] == "launch_failed_before_pwscf"

    exits = {item["id"]: item["exit_code"] for item in run_status["runs"]}
    expected_candidates = {item["id"]: item for item in summary["candidates"]}
    assert exits == {run_id: 0 for run_id in expected_candidates}
    outputs = [_output_audit(run_id, expected_candidates[run_id]) for run_id in exits]

    computed_mesh_pass = all(
        change <= mesh["tolerance_ry"] for change in mesh["adjacent_energy_changes_ry"]
    )
    assert not computed_mesh_pass
    assert mesh["status"] == manifest["gates"]["G4"]["status"] == "FAIL"
    boundary_claims_both_pass = "both adjacent" in mesh["boundary"].lower() and "at or below" in mesh["boundary"].lower()
    assert boundary_claims_both_pass

    phonon_artifacts = [
        artifact["path"]
        for artifact in manifest["artifacts"]
        if re.search(r"\b(ph\.x|phonon|dynamical|q2r|matdyn)\b", f"{artifact['role']} {artifact['path']}", re.IGNORECASE)
    ]
    assert not phonon_artifacts

    return {
        "schema_version": 1,
        "evidence_class": "real-execution-adverse-case-audit",
        "case_id": manifest["case_id"],
        "artifact_integrity": artifact_integrity,
        "termination": {
            "case_manifest_exit_code": manifest["exit_code"],
            "case_manifest_completed_at": manifest["completed_at"],
            "attempt_01": {
                "status": failure["status"],
                "pwscf_started": False,
                "stdout_bytes": attempt_01_stdout.stat().st_size,
                "meaning": failure["failure_boundary"],
            },
            "attempt_02_stage_exit_codes": exits,
            "attempt_02_wrapper_exit_code": int(environment["attempt_02_wrapper_exit_code"]),
            "attempt_02_wrapper_boundary": environment["attempt_02_wrapper_exit_boundary"],
        },
        "recorded_outputs": outputs,
        "numerical_gate": {
            "observable": "fixed-geometry FM total energy",
            "candidate_ids": mesh["candidate_ids"],
            "adjacent_changes_ry": mesh["adjacent_energy_changes_ry"],
            "tolerance_ry": mesh["tolerance_ry"],
            "computed_pass": computed_mesh_pass,
            "recorded_status": mesh["status"],
            "internal_record_inconsistency": "The boundary sentence says both changes pass, but the first change exceeds tolerance and the status is FAIL.",
        },
        "fm_nm_comparison": summary["primary_comparison"],
        "phonons": {
            "artifact_paths": phonon_artifacts,
            "status": "NOT ASSESSED",
            "meaning": "No ph.x, dynamical-matrix, q2r.x, or matdyn.x artifact belongs to this case.",
        },
        "case_acceptance": {
            "G0": manifest["gates"]["G0"]["status"],
            "G1": manifest["gates"]["G1"]["status"],
            "G2": manifest["gates"]["G2"]["status"],
            "G3": manifest["gates"]["G3"]["status"],
            "G4": manifest["gates"]["G4"]["status"],
            "G5": manifest["gates"]["G5"]["status"],
        },
        "supports": manifest["claim_boundary"]["supports"],
        "does_not_support": manifest["claim_boundary"]["does_not_support"],
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
