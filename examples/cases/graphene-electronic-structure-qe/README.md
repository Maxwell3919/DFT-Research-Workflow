# Graphene electronic structure with Quantum ESPRESSO 7.5

This is an execution-ready, deliberately small Quantum ESPRESSO (QE) 7.5
case for a two-atom graphene primitive cell.  It separates a self-consistent
charge-density calculation from a `Gamma-K-M-Gamma` teaching path.  The
committed inputs fix a 20.0 Angstrom out-of-plane cell length and use exactly
one k point along the reciprocal third direction (`kz=1`).  They are a 2D
periodic model, not a finite cluster.

The case was executed with QE 7.5 and a separately supplied, hash-checked
PSLibrary pseudopotential. It retains the independent SCF audit, the fresh
bands-parent SCF, `pw.x` bands output, `bands.x` data, strict parsed tables, and
an original raw-derived PNG. It contains no pseudopotential payload, restart,
or wavefunction files. To reproduce it inside an authorized allocation, use:

```bash
cd examples/cases/graphene-electronic-structure-qe
CASE_RUN_ROOT=/absolute/empty/graphene-qe-run \
PSEUDO_DIR=/path/to/public/pseudos RUN_STAGE=scf \
PW_COMMAND=pw.x BANDS_COMMAND=bands.x \
QE_LAUNCHER='srun --ntasks=1 --cpus-per-task=1 --hint=nomultithread' \
bash run.sh
```

`run.sh` requires `CASE_RUN_ROOT` to name an existing empty directory outside
this case. It reconstructs the complete case there and rejects an omitted,
non-empty, in-case, or child-of-case root, so no committed evidence is
overwritten. It does not submit a job. It is intended to run *inside* an
existing Slurm allocation, hash-checks the selected pseudo before use, and
executes in a temporary directory. It keeps only small, public text outputs and the
band-data file; temporary charge density, wavefunctions, and the pseudo link
are removed on exit.  First run `RUN_STAGE=scf`, then independently audit its
separate stdout/stderr with `qe_guard` in the external reconstructed case.
Only after that audit has passed, write `output/scf-parent-evidence.json` there
with this exact shape (all SHA-256
values bind the files named by their relative keys):

```json
{
  "schema_version": "1.0",
  "case_id": "graphene-qe-2d-teaching",
  "scientific_protocol_id": "graphene-qe-7.5-band-path-teaching-v1",
  "stage": "scf",
  "scf_qeguard_audit_sha256": "<sha256 of output/graphene.scf-qeguard-audit.json>",
  "artifacts": {
    "input/graphene.scf.in": "<sha256>",
    "output/graphene.scf.stdout": "<sha256>",
    "output/graphene.scf.stderr": "<sha256>",
    "output/graphene.scf.exit": "<sha256>",
    "output/execution-environment.txt": "<sha256>"
  }
}
```

Then use `RUN_STAGE=bands`; it refuses to run unless that evidence and the
audited SCF outputs still hash-match.  In its fresh temporary directory it
first repeats the exact hash-bound SCF input as `graphene.bands.parent-scf`,
then performs `pw.x` `calculation='bands'` and `bands.x` against that actual
temporary `save` tree.  Its parent-SCF stdout, stderr, and exit record are
retained separately and are required by the final parser.  This avoids
claiming that a new empty temporary directory can restart from an unrelated
SCF tree.  `RUN_STAGE=all` is deliberately blocked because it would bypass
the independent SCF audit.  The bands stage makes the derived JSON/CSV/PNG and
hash-bound manifest after its successful run.

The first independently captured SCF has `graphene.scf.exit=0`, a zero-byte
stderr, `JOB DONE.`, and an explicit SCF-convergence marker.  An earlier
wrapper revision nevertheless returned 1 after that completed stage because
its final false `if` condition became the shell status.  The current wrapper
ends with explicit `exit 0`; the historical wrapper status is not treated as a
QE-stage failure and remains distinguishable from the retained QE stage exit
record and QE guard audit.

The 20.0 Angstrom cell height, `18x18x1` SCF mesh, `50/400 Ry` cutoffs, and
one displayed path are instructional starting choices.  They are not vacuum,
k-mesh, cutoff, smearing, or band-path convergence evidence.  A path touching
K is useful for teaching graphene's reciprocal-space geometry, but a single
path cannot establish a full-zone band gap, Dirac topology, Fermi-surface
property, material stability, or any broader physical conclusion.
