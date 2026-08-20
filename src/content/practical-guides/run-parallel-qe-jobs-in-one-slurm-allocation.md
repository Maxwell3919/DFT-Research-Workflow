---
topic_slug: test-numerical-convergence
guide_slug: run-parallel-qe-jobs-in-one-slurm-allocation
title: Run Parallel QE Jobs in One Slurm Allocation
kind: implementation
tools:
  - quantum-espresso
status: reviewed
summary: Run several independent QE jobs inside one Slurm allocation with Intel MPI fork bootstrap and explicit taskset affinity, after a short smoke test, instead of assuming concurrent mpirun launchers share the node.
tested_versions:
  - Python 3.12 companion template check
  - Intel MPI Library 2021.5 documented Hydra behavior
execution_script: examples/practical-guides/qe_parallel_universe_smoke.py
source_ids:
  - intel-mpi-hydra-options
  - intel-mpi-hydra-env
  - intel-mpi-pinning
  - slurm-sbatch-docs
media_ids: []
review: docs/reviews/2026-08-20-run-parallel-qe-jobs-in-one-slurm-allocation.md
reviewed_at: "2026-08-20"
---

## Purpose

A convergence gate often contains several independent inputs: multiple cutoffs, smearing widths, or stacking registries that can run at the same time. On a single node, the natural attempt is to start several `mpirun` launchers in the background inside one Slurm allocation. This guide explains why that attempt can silently run only one group, how to verify the real process count, and how to run several independent QE jobs in one allocation with Intel MPI fork bootstrap and explicit `taskset` affinity.

The pattern below is a teaching template, not a site configuration. Replace every placeholder with the local scheduler, MPI installation, and QE path, and run the smoke test before the production job.

## Verify the real process count first

A wrapper that prints `START case CPUs=0-15` proves only that the wrapper printed the requested processor list. It does not prove that the group actually started. Count the real QE processes, not the launcher processes:

~~~bash
pgrep -x pw.x | wc -l
ps -eo pid,ppid,psr,pcpu,stat,etime,args | grep -E 'mpirun|mpiexec.hydra|hydra_pmi_proxy|/pw.x' | grep -v grep
~~~

`pgrep -x pw.x` counts processes whose exact command name is `pw.x`. A count that matches only one group, while several `mpirun` launchers are visible, means the other groups are stuck before QE started. `pgrep -f` with a pattern that also matches the launcher command line overcounts and cannot answer this question. The process table shows the launcher tree; it does not by itself explain why groups blocked.

## Understand the blocking mechanism

Intel MPI's Hydra process manager detects a Slurm environment and converts each `mpirun` bootstrap into an internal `srun` job step. When several such steps start concurrently inside one allocation, and none requests exclusive resources, the steps can block each other instead of running in parallel. The [Intel MPI Global Hydra Options](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/global-hydra-options.html) page documents the `-bootstrap` option, and the [Intel MPI Hydra Environment Variables](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/hydra-environment-variables.html) page documents `I_MPI_HYDRA_BOOTSTRAP` and `I_MPI_JOB_RESPECT_PROCESS_PLACEMENT`. The [Intel MPI Process Pinning](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/process-pinning.html) page documents `I_MPI_PIN` and the distinction between logical and topological processor numbering.

Two consequences follow. First, concurrent internal `srun` steps inside one allocation are not a reliable way to start several MPI universes. Second, an `I_MPI_PIN_PROCESSOR_LIST` written by hand does not map to the Linux CPU numbers shown by `htop`; the enumeration is logical, not the OS numbering. Do not hand-partition the node with that variable.

## Run a short smoke test

Before the production job, prove that several MPI universes can start in parallel inside one allocation. Create a probe that reports its own affinity, then a smoke-test script that starts four groups with fork bootstrap and `taskset`:

~~~bash
cat > report_affinity.sh <<'EOF'
#!/usr/bin/env bash
printf 'pid=%s allowed=' "$$"
taskset -pc $$ | sed 's/.*: //'
sleep 3
EOF
chmod 750 report_affinity.sh

cat > smoke_4mpi_fork.sbatch <<'EOF'
#!/usr/bin/env bash
#SBATCH --job-name=4mpi_test
#SBATCH --nodes=1
#SBATCH --ntasks=64
#SBATCH --exclusive
#SBATCH --time=00:05:00
#SBATCH --output=logs/4mpi-test-%j.out
#SBATCH --error=logs/4mpi-test-%j.err
set -euo pipefail
root=/path/to/your/study
mpirun=/path/to/mpirun
probe=$root/report_affinity.sh
run_group () {
    tag=$1
    mask=$2
    I_MPI_HYDRA_BOOTSTRAP=fork \
    I_MPI_JOB_RESPECT_PROCESS_PLACEMENT=off \
    I_MPI_PIN=0 \
    OMP_NUM_THREADS=1 \
    taskset -c "$mask" \
        "$mpirun" -bootstrap fork -np 16 "$probe" \
        > "$root/logs/4mpi-${SLURM_JOB_ID}-${tag}.out" 2>&1
}
run_group A 0-15 &
p1=$!
run_group B 16-31 &
p2=$!
run_group C 32-47 &
p3=$!
run_group D 48-63 &
p4=$!
wait "$p1"
wait "$p2"
wait "$p3"
wait "$p4"
echo "4-MPI-FORK TEST COMPLETE"
EOF
bash -n smoke_4mpi_fork.sbatch
~~~

The [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html) documents the submission options; the local installation decides which options are honored. `--exclusive` requests the whole node for the allocation; the four groups then partition it with `taskset`. The smoke test runs the probe, not QE, so it finishes in seconds.

Submit and inspect the four group outputs:

~~~bash
TJOB=$(sbatch smoke_4mpi_fork.sbatch | awk '{print $4}')
echo "TJOB=$TJOB"
while squeue -h -j "$TJOB" | grep -q .; do sleep 1; done
for G in A B C D; do
    echo "===== GROUP $G ====="
    echo -n "processes = "
    grep -c '^pid=' logs/4mpi-${TJOB}-${G}.out
    grep '^pid=' logs/4mpi-${TJOB}-${G}.out | sed 's/^.*allowed=//' | sort -ud
done
cat logs/4mpi-test-${TJOB}.err
~~~

A passing smoke test shows four groups, each with the expected number of probe processes, each pinned to its declared mask, and an empty stderr. That proves only that the launcher pattern starts several MPI universes in parallel on this node. It does not run QE, and it does not establish any numerical result.

## Build the production launcher

After the smoke test passes, replace the probe with `pw.x` and add per-case acceptance checks:

~~~bash
cat > run_4registry_fork.sbatch <<'EOF'
#!/usr/bin/env bash
#SBATCH --job-name=qe_reg4
#SBATCH --nodes=1
#SBATCH --ntasks=64
#SBATCH --exclusive
#SBATCH --time=24:00:00
#SBATCH --output=logs/reg4-%j.out
#SBATCH --error=logs/reg4-%j.err
set -euo pipefail
root=/path/to/your/study
mpirun=/path/to/mpirun
pwx=/path/to/pw.x
run_case () {
    C=$1
    MASK=$2
    D=$root/registry_coarse/$C
    cd "$D"
    [[ ! -e relax.out && ! -e relax.err ]] || {
        echo "ERROR: existing output in $C" >&2
        return 10
    }
    mkdir -p tmp
    echo "===== START $C CPU=$MASK ====="
    date
    I_MPI_HYDRA_BOOTSTRAP=fork \
    I_MPI_JOB_RESPECT_PROCESS_PLACEMENT=off \
    I_MPI_PIN=0 \
    OMP_NUM_THREADS=1 \
    taskset -c "$MASK" \
        "$mpirun" -bootstrap fork -np 16 \
        "$pwx" -in relax.in > relax.out 2> relax.err
    grep -q 'JOB DONE.' relax.out
    grep -q 'End of BFGS Geometry Optimization' relax.out
    ! grep -Eqi 'Error in routine|convergence NOT achieved|BFGS.*failed' relax.out
    [[ ! -s relax.err ]]
    rm -rf tmp
    echo "===== PASS $C ====="
}
run_case 01_case_a 0-15 &
p1=$!
run_case 02_case_b 16-31 &
p2=$!
run_case 03_case_c 32-47 &
p3=$!
run_case 04_case_d 48-63 &
p4=$!
rc=0
wait "$p1" || rc=1
wait "$p2" || rc=1
wait "$p3" || rc=1
wait "$p4" || rc=1
echo "===== ALL FINISHED rc=$rc ====="
exit "$rc"
EOF
chmod 750 run_4registry_fork.sbatch
bash -n run_4registry_fork.sbatch
~~~

The acceptance lines are per-case gates: `JOB DONE.` establishes normal program termination, the BFGS line establishes that the relaxation driver finished, the adverse-text search rejects known failure wording, and an empty stderr is a capture check. None of them establishes numerical convergence of the target observable; that remains a separate comparison against a declared criterion. The `rm -rf tmp` removes the scratch directory only after the gates pass; a failed case keeps its artifacts for inspection.

Submit and confirm that every case output starts growing:

~~~bash
JOBID=$(sbatch run_4registry_fork.sbatch | awk '{print $4}')
echo "JOBID=$JOBID"
sleep 15
cat logs/reg4-${JOBID}.out
cat logs/reg4-${JOBID}.err
for C in 01_case_a 02_case_b 03_case_c 04_case_d; do
    printf '%-16s ' "$C"
    ls -lh registry_coarse/$C/relax.out
done
~~~

Fifteen seconds after submission, every case output should be growing, not only the first. If only one grows, stop and inspect the launcher tree again; do not let a partially started job run to completion and then treat its numbers as a completed gate.

## If it fails

Preserve the failed attempt before changing anything: archive the driver output, stderr, and every case directory with its partial outputs, then remove the scratch directories. A partial relaxation is not a scientific result and must not be reused as one. Re-run the smoke test after any change to the launcher, MPI installation, or scheduler configuration.

## Next

With the parallel launcher proven, run the convergence gate and compare the completed rows against the declared criterion. Keep the launcher, rank count, and affinity masks in the study record so the run is reproducible.

## Official sources

- [Intel MPI Global Hydra Options](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/global-hydra-options.html)
- [Intel MPI Hydra Environment Variables](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/hydra-environment-variables.html)
- [Intel MPI Process Pinning](https://www.intel.com/content/www/us/en/docs/mpi-library/developer-reference-linux/current/process-pinning.html)
- [Slurm `sbatch` command reference](https://slurm.schedmd.com/sbatch.html)