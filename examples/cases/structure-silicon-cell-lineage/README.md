# Silicon cell lineage

This is a real local format-and-geometry operation on the repository's public COD 9013102 CIF copy. Run with the versions in `environment.txt`, for example `PYTHON=python3 bash run.sh`; then `bash check.sh`.

It records CIF import, CIF/XYZ/POSCAR conversion, spglib primitive and conventional standardization, a symmetry tolerance sweep, a 2x2x2 supercell, and a SeeK-path reciprocal path. It does not run DFT or recommend calculation settings.
