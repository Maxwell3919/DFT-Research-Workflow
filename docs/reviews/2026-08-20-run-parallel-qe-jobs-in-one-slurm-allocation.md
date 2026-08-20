# Review - Run Parallel QE Jobs in One Slurm Allocation

## Scope and routing

The page adds one subordinate implementation guide under `test-numerical-convergence` without changing the A-E topic registry or treating launcher patterns as new research operations.

`run-parallel-qe-jobs-in-one-slurm-allocation` is an implementation guide. It covers the failure mode of concurrent Intel MPI launchers inside one Slurm allocation, real process-count verification, the fork-bootstrap and `taskset` affinity pattern, a short smoke test, a production launcher with per-case acceptance gates, and failure preservation.

## Command and executable review

The page provides runnable Bash commands for `pgrep`, `ps`, `taskset`, `sbatch`, `squeue`, `grep`, `sed`, `awk`, and `bash -n`. It explains why `pgrep -x pw.x` answers the real-process-count question while `pgrep -f` overcounts, and why `I_MPI_PIN_PROCESSOR_LIST` does not map to the Linux CPU numbers shown by `htop`.

The page is reviewed within the declared single-node parallel-launch teaching scope. The template is a teaching pattern, not a site configuration. Every placeholder must be replaced with the local scheduler, MPI installation, and QE path, and the smoke test must run before the production job. A smoke test proves only that the launcher pattern starts; it does not establish QE convergence or scientific validity. Site configuration, MPI version behavior, and scheduler options remain local facts that must be checked on the target cluster. No cross-site portability claim is made.

## Source and version record

The page reuses the existing tool ID `quantum-espresso` and source ID `slurm-sbatch-docs`. It adds three official Intel MPI Library source records: Global Hydra Options, Hydra Environment Variables, and Process Pinning.

- [Intel MPI Global Hydra Options](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/global-hydra-options.html)
- [Intel MPI Hydra Environment Variables](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/hydra-environment-variables.html)
- [Intel MPI Process Pinning](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/process-pinning.html)
- [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html)

The companion scope is pinned to Python 3.12 and the Intel MPI Library 2021.5 documented Hydra behavior. The page does not claim that environment-variable names, defaults, or scheduler interactions are unchanged in another MPI release.

## Companion and artifact review

`qe_parallel_universe_smoke.py` uses only the Python standard library. It generates the teaching sbatch template to stdout and statically validates it: `bash -n` syntax, the presence of the fork-bootstrap and affinity patterns, four background launches, and four non-overlapping masks covering the declared allocation. It does not write files, submit or cancel jobs, or run QE.

## Scientific and claim boundary

The page separates launcher behavior from QE termination, numerical convergence, and scientific validity. It supports teaching how to run several independent QE jobs in one allocation. It does not establish that a specific MPI installation behaves this way, that a submitted job will start, that any QE output is converged, or that any scientific result is valid. The per-case acceptance gates are presented as termination and capture checks, not as convergence criteria.

No media are added. Source reachability, companion execution, content validation, build, and browser behavior remain separate checks and were not run as part of this file-creation task.

## Operational closure

The guide requires the real process count to be verified before trusting a parallel launch, requires a short smoke test before the production job, and requires failed attempts to be preserved rather than reused. The resource partitioning is presented as a declared site decision, not a universal rule.