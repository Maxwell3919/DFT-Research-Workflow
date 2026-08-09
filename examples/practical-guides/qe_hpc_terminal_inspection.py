"""Inspect the committed bcc-Fe QE case without changing any case artifact."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CASE = ROOT / "examples/cases/bcc-fe-spin-qe"
ATTEMPT_01 = CASE / "output/attempt-01-slurm-launch-failure"
ATTEMPT_02 = CASE / "output/attempt-02-pmix"
ENERGY = re.compile(r"!\s+total energy\s+=\s+([-+0-9.Ee]+)\s+Ry")
FERMI = re.compile(r"the Fermi energy is\s+([-+0-9.Ee]+)\s+ev", re.IGNORECASE)
WARNING_OR_FATAL = re.compile(
    r"\bwarning\b|error in routine|convergence NOT achieved|no convergence has been achieved|"
    r"segmentation fault|out of memory|oom-kill|killed by signal",
    re.IGNORECASE,
)


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _load_json(path: Path) -> dict[str, object]:
    return json.loads(path.read_text(encoding="utf-8"))


def _verify_manifest_artifacts(manifest: dict[str, object]) -> dict[str, object]:
    checked: list[str] = []
    total_bytes = 0
    for artifact in manifest["artifacts"]:
        path = CASE / artifact["path"]
        data = path.read_bytes()
        assert len(data) == artifact["bytes"], f"size mismatch: {artifact['path']}"
        assert hashlib.sha256(data).hexdigest() == artifact["sha256"], (
            f"SHA-256 mismatch: {artifact['path']}"
        )
        checked.append(artifact["path"])
        total_bytes += len(data)
    return {
        "declared_artifacts_checked": len(checked),
        "declared_bytes_checked": total_bytes,
        "all_declared_sizes_and_sha256_match": True,
    }


def _stage_log(run_id: str) -> dict[str, object]:
    stdout = ATTEMPT_02 / f"{run_id}.out"
    stderr = ATTEMPT_02 / f"{run_id}.err"
    text = stdout.read_text(encoding="utf-8")
    energies = ENERGY.findall(text)
    fermi_energies = FERMI.findall(text)
    flagged = [line.strip() for line in text.splitlines() if WARNING_OR_FATAL.search(line)]
    assert text.count("Program PWSCF v.7.5") == 1, f"unexpected QE banner count: {run_id}"
    assert text.count("JOB DONE.") == 1, f"unexpected JOB DONE count: {run_id}"
    assert "convergence has been achieved" in text, f"missing SCF marker: {run_id}"
    assert energies and fermi_energies, f"missing final observable text: {run_id}"
    return {
        "run_id": run_id,
        "stdout": str(stdout.relative_to(ROOT)),
        "stdout_bytes": stdout.stat().st_size,
        "stdout_lines": len(text.splitlines()),
        "stdout_sha256": _sha256(stdout),
        "stderr_bytes": stderr.stat().st_size,
        "qe_banner": "PWSCF 7.5",
        "job_done_marker": True,
        "scf_convergence_marker": True,
        "final_total_energy_ry": float(energies[-1]),
        "final_fermi_energy_ev": float(fermi_energies[-1]),
        "warning_or_fatal_lines": flagged,
    }


def run() -> dict[str, object]:
    manifest = _load_json(CASE / "manifest.json")
    attempt_01 = _load_json(ATTEMPT_01 / "failure-manifest.json")
    attempt_02 = _load_json(ATTEMPT_02 / "run-status.json")
    mesh_screen = _load_json(CASE / "derived/attempt-02-pmix/fm-kmesh-screen.json")
    assert manifest["case_id"] == "bcc-fe-spin-qe"
    assert manifest["evidence_class"] == "real-execution"
    artifact_check = _verify_manifest_artifacts(manifest)

    failed_stdout = ATTEMPT_01 / "fm-k8.out"
    failed_stderr = ATTEMPT_01 / "fm-k8.err"
    incomplete_status = (ATTEMPT_01 / "run-status.json").read_text(encoding="utf-8")
    try:
        json.loads(incomplete_status)
    except json.JSONDecodeError:
        attempt_01_status_is_valid_json = False
    else:
        attempt_01_status_is_valid_json = True
    assert failed_stdout.stat().st_size == 0
    assert "SLURM's PMI support" in failed_stderr.read_text(encoding="utf-8")
    assert attempt_01["status"] == "launch_failed_before_pwscf"
    assert not attempt_01_status_is_valid_json

    exit_codes = {item["id"]: item["exit_code"] for item in attempt_02["runs"]}
    assert exit_codes == {"fm-k8": 0, "fm-k10": 0, "fm-k12": 0, "nm-k12": 0}
    stage_logs = [_stage_log(run_id) for run_id in exit_codes]
    assert mesh_screen["status"] == "FAIL"
    assert manifest["gates"]["G4"]["status"] == "FAIL"

    return {
        "schema_version": 1,
        "evidence_class": "real-execution-read-only-inspection",
        "case_id": manifest["case_id"],
        "filesystem_inventory": {
            "case_root": str(CASE.relative_to(ROOT)),
            "committed_file_count": sum(1 for path in CASE.rglob("*") if path.is_file()),
            **artifact_check,
        },
        "attempt_01": {
            "status": attempt_01["status"],
            "stdout_bytes": failed_stdout.stat().st_size,
            "stderr_sha256": _sha256(failed_stderr),
            "preserved_run_status_is_valid_json": attempt_01_status_is_valid_json,
            "meaning": "The launcher failed before PWSCF. This is scheduler/MPI integration evidence, not a QE or SCF result.",
        },
        "attempt_02": {
            "recorded_stage_exit_codes": exit_codes,
            "stage_logs": stage_logs,
            "meaning": "The four recorded stages exited zero and contain QE/SCF completion markers; this does not override the failed numerical gate.",
        },
        "live_scheduler_state": {
            "checked": False,
            "reason": "Committed files cannot establish a current squeue, sacct, or scontrol state.",
        },
        "case_gate": {
            "manifest_exit_code": manifest["exit_code"],
            "completed_at": manifest["completed_at"],
            "g4_status": mesh_screen["status"],
            "adjacent_energy_changes_ry": mesh_screen["adjacent_energy_changes_ry"],
            "tolerance_ry": mesh_screen["tolerance_ry"],
        },
        "claim_boundary": "This companion checks committed file identity and recorded terminal evidence only. It does not inspect a live job, submit or cancel work, prove numerical convergence, validate phonons, or support a material conclusion.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
