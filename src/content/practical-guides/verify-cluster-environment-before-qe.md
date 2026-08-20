---
topic_slug: test-numerical-convergence
guide_slug: verify-cluster-environment-before-qe
title: Verify the Cluster Environment Before Running QE
kind: implementation
tools:
  - quantum-espresso
status: reviewed
summary: Run a read-only pre-flight check of host, scheduler, MPI, QE executable, pseudopotential location, and load before starting a QE convergence series, and record the observations with a declared resource cap.
tested_versions:
  - Python 3.12 companion report
  - Quantum ESPRESSO 7.5 documented input format
execution_script: examples/practical-guides/verify_qe_environment.py
source_ids:
  - qe-pw-75
  - slurm-sbatch-docs
  - slurm-squeue-docs
media_ids: []
review: docs/reviews/2026-08-20-verify-cluster-environment-before-qe.md
reviewed_at: "2026-08-20"
---

## Purpose

A convergence series assumes a stable execution environment. Before generating inputs, submitting jobs, or comparing energies, record the host, scheduler, MPI launcher, QE executable, pseudopotential location, and current load as observations. The environment is a local fact: the same commands can resolve differently on another cluster, and a reachable homepage or installed binary does not prove that the documented capability works in the tested version.

The checks below are read-only. They report what the current shell can resolve and what the filesystem currently contains. None of them proves that a calculation will start, converge, or be scientifically valid.

## Record the host identity

Start in the working directory that will own the study, then record the machine and its visible topology:

~~~bash
cd /path/to/your/study
pwd -P
hostname
nproc
lscpu | grep -E 'Model name|Socket|Core|Thread|CPU\(s\)'
~~~

`hostname` identifies the machine as the current shell sees it. `nproc` reports the number of processing units visible to the current process, which can differ from the scheduler's allocation. `lscpu` summarizes the physical topology; the exact fields and their names are implementation-specific. None of these commands proves that the scheduler, MPI, or QE build is compatible with this host.

## Check the scheduler

Record whether a scheduler is present and which commands resolve:

~~~bash
command -v sbatch || true
command -v squeue || true
~~~

`command -v` proves only which command the current shell would resolve. A missing `sbatch` means the local environment is not a Slurm login node as configured; a present one does not prove that submissions are permitted, that a partition exists, or that the scheduler is healthy. The [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html) and the [Slurm `squeue` command reference](https://slurm.schedmd.com/squeue.html) document the commands; the local installation decides their availability and defaults.

## Check the MPI launcher

Record the launcher that the current shell resolves and its version banner:

~~~bash
command -v mpirun || true
mpirun --version 2>&1 | head -10
~~~

The version banner identifies the currently resolved launcher, not the launcher used by a previous job and not its compatibility with the installed QE build or the scheduler. A launcher that resolves on the login node may not exist on a compute node. Record the exact path and version; do not assume that `mpirun` on `PATH` is the launcher the scheduler will use.

## Check the QE executable

Record which `pw.x` the shell resolves and where QE builds live:

~~~bash
command -v pw.x || true
find /path/to/software -maxdepth 5 -type f -name pw.x 2>/dev/null | head -20
~~~

`command -v pw.x` proves only which executable the current shell would resolve. The `find` inventory shows which QE builds exist under the declared software root; it does not prove that a build is complete, that its modules are loadable, or that it matches the pseudopotential set. When several builds exist, record the exact version banner from the saved output of a completed run rather than guessing from a directory name. The [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html) documents the input format; it does not describe your installation.

## Check the pseudopotential location

QE inputs declare `pseudo_dir`; the files must exist at that path on the machine that will run the job:

~~~bash
find /path/to/pslibrary -maxdepth 6 -type f -name '*.UPF' 2>/dev/null | head -20
~~~

A bounded `find` shows which pseudopotential files exist under the declared library root. Existence and filename are not proof of content identity: bind each file with its SHA-256 and compare it with the receipt created when the pseudopotential was selected. A different hash is a different method object. The `pseudo_dir` path in every input must be the path that the compute node can read, which is not necessarily the path that the login node displays.

## Check the current load

Record the load before submitting anything:

~~~bash
uptime
ps -eo user,pid,psr,pcpu,pmem,comm --sort=-pcpu | head -30
~~~

`uptime` reports the load average as the kernel computes it; `ps` shows the most CPU-active processes visible to the current user at that instant. Both are snapshots that drift. A quiet snapshot does not guarantee that the node stays quiet, and a busy one does not prove that a small job cannot start. Re-check immediately before submission.

## Declare a resource cap

Before submitting, write the resource policy into the study record: the maximum number of logical threads the whole task line may occupy at any moment, and the rank count for the current gate. A cap is a decision, not a measurement. The declared cap does not require using all of it; a small SCF is often faster with fewer ranks than with the maximum allowed.

## Record the observations

Write the environment report into the study record with its timestamp:

~~~bash
python3 examples/practical-guides/verify_qe_environment.py --pseudo-dir /path/to/pslibrary \
  | tee environment-report.txt
~~~

The companion runs the read-only checks above and prints a structured report. It reports observations; it does not judge whether the environment is adequate, submit a job, or run QE. Keep the report with the study plan so that a later reader can see which host, launcher, QE build, and pseudopotential root the series assumed.

## Next

With the environment recorded and the resource cap declared, generate the convergence inputs and submit the first gate. Re-run the environment checks if the host, module, launcher, or pseudopotential root changes; a convergence series that spans two different environments must record the boundary explicitly.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html)
- [Slurm `squeue` command reference](https://slurm.schedmd.com/squeue.html)