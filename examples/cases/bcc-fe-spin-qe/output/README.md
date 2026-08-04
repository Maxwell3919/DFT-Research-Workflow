# Runtime outputs pending

This directory intentionally contains no QE output before an authorized run.
`run.sh` will write one stdout and one stderr file for each declared candidate,
plus a privacy-screened `run-status.json`.  The UPF, `*.save` tree, restart
files, and run directory remain outside this public case.
