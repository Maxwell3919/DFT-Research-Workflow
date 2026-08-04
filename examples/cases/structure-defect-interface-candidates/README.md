# Vacancy and interface construction candidates

This case is a real local structure-operation record, not a DFT calculation. It builds two bounded candidates: an unrelaxed Si one-site-deletion vacancy geometry with no encoded charge state in a 2x2x2 diamond supercell, and an imposed-common-lattice graphene/h-BN bilayer. The latter is deliberately a geometric starting configuration: its zero reported in-plane mismatch follows the imposed common lattice constant and is not a relaxed epitaxial match.

Run only in an existing empty directory outside the repository:

```bash
CASE_RUN_ROOT=/absolute/path/to/empty/structure-candidates-run PYTHON=python3 bash run.sh
cd /absolute/path/to/empty/structure-candidates-run
bash check.sh
bash extract.sh
```

`run.sh` rejects a missing, nonempty, in-repository, or symlinked-back-into-repository run root. It copies this case to that external root before generating the recorded source, input, output, derived table, report, figure, and manifest. The procedure uses ASE for construction and pymatgen for an independent periodic-structure materialization/metric check.

The files support only the recorded construction, atom counts, explicit vacancy deletion, common-cell bilayer placement, and geometry metrics. They do not support vacancy formation energy, charge-state energetics, defect concentration, interfacial adhesion, band alignment, strain stability, an optimal registry, or a DFT parameter recommendation.
