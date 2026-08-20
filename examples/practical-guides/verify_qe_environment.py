"""Read-only QE environment preflight report for a compute cluster.

Runs a fixed set of shell commands (host, scheduler, MPI, QE, load) and
prints a structured observation report. Every command is captured
separately (stdout / stderr / returncode); a failing or missing command
is reported as an observation and never aborts the report.

Teaching boundary: this script reports observations only. A binary being
on PATH, or a version banner printing, is not a guarantee that the
environment can run a specific calculation. The script does not submit
jobs, does not run QE, does not modify files, and does not access the
network. It does not judge whether an environment is "qualified".
"""
from __future__ import annotations

import argparse
import subprocess
from typing import NamedTuple, Sequence

TIMEOUT_SECONDS = 30.0

LSCPU_FIELDS = (
    "Model name",
    "Socket(s)",
    "Core(s) per socket",
    "Thread(s) per core",
    "CPU(s)",
)


class CmdResult(NamedTuple):
    ok: bool
    returncode: int
    stdout: str
    stderr: str


def _as_text(value: str | bytes | None) -> str:
    if isinstance(value, bytes):
        return value.decode(errors="replace")
    return value or ""


def run_cmd(cmd: Sequence[str], *, shell: bool = False) -> CmdResult:
    """Run one command, capturing stdout/stderr/returncode without raising."""
    try:
        proc = subprocess.run(
            cmd,
            shell=shell,
            text=True,
            capture_output=True,
            check=False,
            timeout=TIMEOUT_SECONDS,
        )
        return CmdResult(
            ok=proc.returncode == 0,
            returncode=proc.returncode,
            stdout=proc.stdout or "",
            stderr=proc.stderr or "",
        )
    except subprocess.TimeoutExpired as error:
        return CmdResult(
            ok=False,
            returncode=-1,
            stdout=_as_text(error.stdout),
            stderr=f"timed out after {TIMEOUT_SECONDS:.0f}s",
        )
    except OSError as error:
        return CmdResult(ok=False, returncode=-2, stdout="", stderr=str(error))


def emit(name: str, lines: Sequence[str], note: str) -> None:
    print(f"===== CHECK: {name} =====")
    for line in lines:
        print(line)
    print(f"note: {note}")


def command_path(name: str) -> str:
    """Return 'name: /path' or 'name: NOT FOUND' from `command -v`."""
    result = run_cmd(f"command -v {name}", shell=True)
    path = result.stdout.strip()
    if result.ok and path:
        return f"{name}: {path}"
    return f"{name}: NOT FOUND"


def parse_lscpu(stdout: str) -> list[str]:
    found: dict[str, str] = {}
    for raw in stdout.splitlines():
        line = raw.strip()
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        if key in LSCPU_FIELDS:
            found[key] = value.strip()
    return [f"lscpu {key}: {found.get(key, '(field absent)')}" for key in LSCPU_FIELDS]


def check_host() -> None:
    hostname = run_cmd(["hostname"])
    nproc = run_cmd(["nproc"])
    lscpu = run_cmd(["lscpu"])

    lines: list[str] = []
    if hostname.ok and hostname.stdout.strip():
        lines.append(f"hostname: {hostname.stdout.strip()}")
    else:
        lines.append(f"hostname: FAILED ({hostname.stderr.strip() or 'no output'})")

    if nproc.ok and nproc.stdout.strip():
        lines.append(f"nproc: {nproc.stdout.strip()}")
    else:
        lines.append(f"nproc: FAILED ({nproc.stderr.strip() or 'no output'})")

    if lscpu.ok and lscpu.stdout.strip():
        lines.extend(parse_lscpu(lscpu.stdout))
    else:
        lines.append(f"lscpu: FAILED ({lscpu.stderr.strip() or 'command not found'})")

    emit(
        "host",
        lines,
        "Reported topology is an observation. It does not guarantee the queue "
        "allocation, affinity, or MPI placement used by a real run.",
    )


def check_scheduler() -> None:
    emit(
        "scheduler",
        [command_path("sbatch"), command_path("squeue")],
        "Command presence only shows the executables are on PATH. It does not "
        "verify queue access, partition policy, or account credentials.",
    )


def check_mpi() -> None:
    found = run_cmd("command -v mpirun", shell=True)
    path = found.stdout.strip()
    if not (found.ok and path):
        emit(
            "mpi",
            ["mpirun: NOT FOUND"],
            "No mpirun on PATH. MPI launchers are often module- or spack-loaded; "
            "absence here does not prove MPI is absent on the cluster.",
        )
        return

    lines = [f"mpirun: {path}"]
    version = run_cmd(["mpirun", "--version"])
    if version.ok and version.stdout.strip():
        first_lines = [line for line in version.stdout.splitlines() if line.strip()][:4]
        lines.append("mpirun --version (first lines):")
        lines.extend(f"  {line}" for line in first_lines)
    else:
        detail = version.stderr.strip() or f"exit {version.returncode}"
        lines.append(f"mpirun --version: FAILED ({detail[:200]})")

    emit(
        "mpi",
        lines,
        "The version banner describes the launcher build, not the runtime "
        "behaviour (bootstrap, PMI, placement) of a live job.",
    )


def check_qe(pseudo_dir: str | None) -> None:
    lines = [command_path("pw.x")]

    if pseudo_dir:
        find_cmd = ["find", pseudo_dir, "-maxdepth", "2", "-type", "f", "-name", "*.UPF"]
        result = run_cmd(find_cmd)
        if result.ok:
            upf = [p for p in result.stdout.splitlines() if p.strip()]
            lines.append(f"UPF files under {pseudo_dir}: {len(upf)}")
            for path in upf[:10]:
                lines.append(f"  {path}")
            if len(upf) > 10:
                lines.append(f"  ... and {len(upf) - 10} more (truncated)")
        else:
            detail = result.stderr.strip() or f"exit {result.returncode}"
            lines.append(f"find in {pseudo_dir}: FAILED ({detail[:200]})")
    else:
        lines.append("pseudo-dir: not requested (pass --pseudo-dir PATH to scan for *.UPF)")

    emit(
        "qe",
        lines,
        "pw.x on PATH does not guarantee a matching pseudopotential set, a "
        "working scalar/MPI build, or the numerical behaviour of a run. "
        "A *.UPF listing only proves file presence, not their content or validity.",
    )


def check_load() -> None:
    uptime = run_cmd(["uptime"])
    ps = run_cmd(["ps", "-eo", "user,pid,psr,pcpu,pmem,comm", "--sort=-pcpu"])

    lines: list[str] = []
    if uptime.ok and uptime.stdout.strip():
        lines.append(f"uptime: {uptime.stdout.strip()}")
    else:
        lines.append(f"uptime: FAILED ({uptime.stderr.strip() or 'no output'})")

    if ps.ok and ps.stdout.strip():
        rows = [line for line in ps.stdout.splitlines() if line.strip()]
        lines.append("top 10 processes by %cpu (user pid psr %cpu %mem comm):")
        lines.extend(f"  {line}" for line in rows[:10])
        if len(rows) > 10:
            lines.append(f"  ... {len(rows) - 10} more rows not shown")
    else:
        detail = ps.stderr.strip() or "ps unavailable on this platform"
        lines.append(f"ps: FAILED ({detail[:200]})")

    emit(
        "load",
        lines,
        "Load is transient. A snapshot here does not predict the node state at "
        "submission time or the performance of a future job.",
    )


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    root.add_argument(
        "--pseudo-dir",
        type=str,
        default=None,
        metavar="PATH",
        help=(
            "Optional directory to scan for *.UPF pseudopotential files "
            "(bounded to two levels deep; listing truncated to 10 entries). "
            "Default: no scan is performed."
        ),
    )
    return root


def main() -> int:
    args = parser().parse_args()
    check_host()
    check_scheduler()
    check_mpi()
    check_qe(args.pseudo_dir)
    check_load()
    print(
        "note: This report is observational only. It does not certify the "
        "environment for any calculation."
    )
    print("Environment report complete.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
