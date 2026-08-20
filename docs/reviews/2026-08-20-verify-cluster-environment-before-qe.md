# Review - Verify the Cluster Environment Before Running QE

## Scope and routing

The page adds one subordinate implementation guide under `test-numerical-convergence` without changing the A-E topic registry or treating environment checks as new research operations.

`verify-cluster-environment-before-qe` is an implementation guide. It covers host identity, scheduler presence, MPI launcher version, QE executable discovery, pseudopotential location, current load, a declared resource cap, and recording the observations. Every check is read-only and states what it can observe and what it cannot establish.

## Command and executable review

The page provides runnable Bash commands for `pwd`, `hostname`, `nproc`, `lscpu`, `command -v`, `mpirun --version`, `find`, `uptime`, and `ps`. It covers `sbatch` and `squeue` presence checks and the `pw.x` executable inventory. The companion `verify_qe_environment.py` runs the same read-only checks and prints a structured report.

The page is reviewed within the declared read-only environment-verification scope. The report records observations; it does not prove that a calculation will run, converge, or be scientifically valid. Scheduler, MPI, and QE presence do not establish compatibility, correctness, or numerical convergence. Site configuration, module loading, launcher integration, and filesystem visibility remain local facts that must be checked on the target cluster. No Slurm version or cross-site portability claim is made.

## Source and version record

The page reuses the existing tool ID `quantum-espresso` and source IDs `qe-pw-75`, `slurm-sbatch-docs`, and `slurm-squeue-docs`.

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html)
- [Slurm `squeue` command reference](https://slurm.schedmd.com/squeue.html)

The companion scope is pinned to Python 3.12 and the Quantum ESPRESSO 7.5 documented input format. The page does not claim that command syntax, output text, defaults, or launchers are unchanged in another release.

## Companion and artifact review

`verify_qe_environment.py` uses only the Python standard library. It is read-only: it runs the declared inspection commands, captures stdout/stderr/return codes, and prints a structured report to stdout. It does not write files, submit or cancel jobs, run QE, or access a private host. A missing command is reported as NOT FOUND rather than treated as a failure of the report.

## Scientific and claim boundary

The page separates environment observation from execution readiness, numerical convergence, and scientific validity. It supports teaching how to record the environment a convergence series assumes. It does not establish that a calculation will start, that the scheduler is healthy, that the MPI launcher is compatible with the QE build, that the pseudopotential files are the reviewed bytes, or that any numerical result is valid.

No media are added. Source reachability, companion execution, content validation, build, and browser behavior remain separate checks and were not run as part of this file-creation task.

## Operational closure

The guide supplies real read-only command forms for every environment check, each with its observation boundary, and requires the report to be recorded with the study plan. The resource cap is presented as a declared decision, not a measurement or a universal rule.