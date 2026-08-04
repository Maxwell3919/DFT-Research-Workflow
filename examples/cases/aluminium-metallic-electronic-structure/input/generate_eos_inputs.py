#!/usr/bin/env python3
"""Emit five unexecuted external SCF inputs for a bounded Aluminium E(V) curve."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PLAN = json.loads((ROOT / "eos-plan.json").read_text(encoding="utf-8"))
TEMPLATE = """&CONTROL
  calculation = 'scf'
  prefix = '{prefix}'
  pseudo_dir = './pseudo'
  outdir = './tmp'
  verbosity = 'high'
/
&SYSTEM
  ibrav = 0
  nat = 1
  ntyp = 1
  ecutwfc = 30.0
  ecutrho = 240.0
  occupations = 'smearing'
  smearing = 'mv'
  degauss = 0.02
/
&ELECTRONS
  conv_thr = 1.0d-10
/
ATOMIC_SPECIES
  Al  26.9815385  Al.pbe-n-rrkjus_psl.1.0.0.UPF
ATOMIC_POSITIONS crystal
  Al  0.0 0.0 0.0
CELL_PARAMETERS bohr
  -{half_a:.6f}  0.000000  {half_a:.6f}
   0.000000  {half_a:.6f}  {half_a:.6f}
  -{half_a:.6f}  {half_a:.6f}  0.000000
K_POINTS automatic
  12 12 12 0 0 0
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True, help="A new, nonexistent external directory for generated inputs.")
    args = parser.parse_args()
    if args.output_dir.exists():
        raise SystemExit(f"FAIL output directory already exists: {args.output_dir}")
    args.output_dir.mkdir(parents=True)
    for sample in PLAN["samples"]:
        text = TEMPLATE.format(prefix=sample["id"], half_a=sample["cubic_lattice_parameter_bohr"] / 2.0)
        (args.output_dir / f"{sample['id']}.in").write_text(text, encoding="utf-8")
    (args.output_dir / "eos-plan.json").write_text(json.dumps(PLAN, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"PASS generated {len(PLAN['samples'])} unexecuted E(V) SCF inputs under {args.output_dir}")


if __name__ == "__main__":
    main()
