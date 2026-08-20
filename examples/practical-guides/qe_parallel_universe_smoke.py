"""Generate and statically validate an sbatch template for a teaching
single-node 'parallel universe' MPI layout.

The template runs four independent 16-process MPI groups on one exclusive
node (64 tasks total) using Intel MPI's fork bootstrap plus taskset
affinity masks. It is printed to stdout only; nothing is written to disk.

Teaching boundary: this is a teaching pattern, not a site configuration.
Before any real submission the $root / $mpirun / $probe placeholders must
be replaced with the cluster's scheduler, MPI installation, and QE
executable paths. This script does not submit a job, does not run QE, and
does not validate MPI placement behaviour on a live node. Static checks
(bash syntax and expected patterns) prove only what the template text
says, not that the pattern works on any specific system.
"""
from __future__ import annotations

import argparse
import re
import subprocess

GROUPS = (("A", "0-15"), ("B", "16-31"), ("C", "32-47"), ("D", "48-63"))

REQUIRED_PATTERNS = (
    ("Intel MPI fork bootstrap env", "I_MPI_HYDRA_BOOTSTRAP=fork"),
    ("process placement disabled", "I_MPI_JOB_RESPECT_PROCESS_PLACEMENT=off"),
    ("Intel MPI pinning off", "I_MPI_PIN=0"),
    ("taskset affinity", "taskset -c"),
    ("fork bootstrap flag", "-bootstrap fork"),
)

MASK_RE = re.compile(r"run_group\s+\S+\s+\"([0-9,-]+)\"")


def template_text() -> str:
    group_lines = "\n".join(f'run_group {label} "{mask}" &' for label, mask in GROUPS)
    return f"""#!/bin/bash
#SBATCH --nodes=1
#SBATCH --ntasks=64
#SBATCH --exclusive
#SBATCH --time=00:20:00
#SBATCH --output=$root/slurm-%j.out
#SBATCH --error=$root/slurm-%j.err
#
# Teaching template: 'parallel universe' on a single exclusive node.
# Four independent groups of 16 MPI ranks, each pinned to its own
# 16-CPU mask via taskset, launched with Intel MPI fork bootstrap.
#
# Placeholders to replace before any real submission:
#   $root   -> absolute working/output directory on the cluster
#   $mpirun -> absolute path to the site MPI launcher (mpirun)
#   $probe  -> absolute path to a QE probe binary (e.g. pw.x) or a
#              site sanity program
#
# This template is intentionally NOT a site configuration.

set -u

run_group() {{
    local label="$1"
    local mask="$2"
    echo "[${{label}}] starting 16 ranks on CPUs ${{mask}}"
    I_MPI_HYDRA_BOOTSTRAP=fork \\
    I_MPI_JOB_RESPECT_PROCESS_PLACEMENT=off \\
    I_MPI_PIN=0 \\
    OMP_NUM_THREADS=1 \\
    taskset -c "$mask" "$mpirun" -bootstrap fork -np 16 "$probe"
}}

{group_lines}
wait
"""


def expand_mask(mask: str) -> set[int]:
    cpus: set[int] = set()
    for part in mask.split(","):
        if "-" in part:
            low, _, high = part.partition("-")
            cpus.update(range(int(low), int(high) + 1))
        else:
            cpus.add(int(part))
    return cpus


def validate_template(text: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []

    syntax = subprocess.run(
        ["bash", "-n"], input=text, text=True, capture_output=True, check=False
    )
    if syntax.returncode == 0:
        results.append(
            {"check": "bash -n syntax", "status": "PASS", "detail": "shell parser accepted the template"}
        )
    else:
        detail = syntax.stderr.strip() or f"exit {syntax.returncode}"
        results.append({"check": "bash -n syntax", "status": "FAIL", "detail": detail})

    for label, pattern in REQUIRED_PATTERNS:
        if pattern in text:
            results.append(
                {"check": f"pattern: {label}", "status": "PASS", "detail": f"found {pattern!r}"}
            )
        else:
            results.append(
                {"check": f"pattern: {label}", "status": "FAIL", "detail": f"missing {pattern!r}"}
            )

    launches = [line for line in text.splitlines() if "run_group" in line and line.strip().endswith("&")]
    if len(launches) == len(GROUPS):
        results.append(
            {
                "check": "background launches",
                "status": "PASS",
                "detail": f"found {len(launches)} run_group '&' background launches",
            }
        )
    else:
        results.append(
            {
                "check": "background launches",
                "status": "FAIL",
                "detail": f"expected {len(GROUPS)} '&' launches, found {len(launches)}",
            }
        )

    masks = MASK_RE.findall(text)
    expanded = [expand_mask(mask) for mask in masks]
    union: set[int] = set()
    for cpus in expanded:
        union |= cpus
    total = sum(len(cpus) for cpus in expanded)
    if len(masks) == len(GROUPS) and union == set(range(64)) and total == 64:
        results.append(
            {
                "check": "taskset mask coverage",
                "status": "PASS",
                "detail": "four 16-CPU masks cover CPUs 0-63 with no overlap",
            }
        )
    else:
        results.append(
            {
                "check": "taskset mask coverage",
                "status": "FAIL",
                "detail": (
                    f"parsed masks {masks!r}; expected 4 disjoint 16-CPU masks "
                    f"covering 0-63 (got union size {len(union)}, total {total})"
                ),
            }
        )

    return results


def parser() -> argparse.ArgumentParser:
    return argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )


def main() -> int:
    parser().parse_args()
    text = template_text()
    print(text.rstrip())
    print()
    print("===== TEMPLATE VALIDATION =====")
    results = validate_template(text)
    all_pass = True
    for result in results:
        if result["status"] != "PASS":
            all_pass = False
        print(f"{result['status']}: {result['check']} - {result['detail']}")
    if all_pass:
        print("Template generated and all static checks passed.")
    else:
        print("Template generated but static checks FAILED.")
    print(
        "note: teaching template only; replace $root / $mpirun / $probe per site "
        "before any real submission. No job was submitted and QE was not run."
    )
    return 0 if all_pass else 1


if __name__ == "__main__":
    raise SystemExit(main())
