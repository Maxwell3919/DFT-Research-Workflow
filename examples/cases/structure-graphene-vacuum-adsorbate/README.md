# Graphene vacuum and adsorbate construction

Run with the versions in `environment.txt` in an existing empty directory outside
the repository, for example `CASE_RUN_ROOT=/absolute/empty/graphene-structure-run
PYTHON=python3 bash run.sh`, then run `bash check.sh` from that reconstructed
run root. The entrypoint rejects an omitted, non-empty, in-case, or
child-of-case root, so committed source, output, derived, figures, and manifest
files cannot be overwritten. This is an executed ASE construction of a finite-z
graphene model and an H candidate; it is not a relaxation or adsorption-energy
calculation.
