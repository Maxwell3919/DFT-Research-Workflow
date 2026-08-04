# Silicon cell lineage

This is a real local format-and-geometry operation on the repository's public COD 9013102 CIF copy. Run with the versions in `environment.txt` in an existing empty directory outside the repository, for example `CASE_RUN_ROOT=/absolute/empty/silicon-structure-run PYTHON=python3 bash run.sh`; then run `bash check.sh` from that reconstructed run root. The entrypoint rejects an omitted, non-empty, in-case, or child-of-case root, so committed source, output, derived, figures, and manifest files cannot be overwritten.

It records CIF import, CIF/XYZ/POSCAR conversion, spglib primitive and conventional standardization, a symmetry tolerance sweep, a 2x2x2 supercell, and a SeeK-path reciprocal path. It does not run DFT or recommend calculation settings.
