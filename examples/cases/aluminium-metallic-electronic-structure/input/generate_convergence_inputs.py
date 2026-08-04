#!/usr/bin/env python3
"""Emit a new, external-only Aluminium SCF convergence input matrix.

The generated inputs are intentionally not executed by this script.  They keep
the case geometry, pseudopotential identity, cutoff, and metallic policy fixed
while changing only the declared k mesh or degauss value.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PLAN = json.loads((ROOT / "convergence-matrix-plan.json").read_text(encoding="utf-8"))

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
  degauss = {degauss_ry:.2f}
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
  {kx} {ky} {kz} 0 0 0
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, required=True, help="A new, nonexistent external directory for generated inputs.")
    args = parser.parse_args()
    if args.output_dir.exists():
        raise SystemExit(f"FAIL output directory already exists: {args.output_dir}")
    args.output_dir.mkdir(parents=True)
    for sample in PLAN["samples"]:
        kx, ky, kz = sample["k_mesh"]
        text = TEMPLATE.format(prefix=sample["id"], degauss_ry=sample["degauss_ry"], half_a=PLAN["fixed_protocol"]["cubic_lattice_parameter_bohr"] / 2.0, kx=kx, ky=ky, kz=kz)
        (args.output_dir / f"{sample['id']}.in").write_text(text, encoding="utf-8")
    (args.output_dir / "convergence-matrix-plan.json").write_text(json.dumps(PLAN, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(f"PASS generated {len(PLAN['samples'])} unexecuted SCF inputs under {args.output_dir}")


if __name__ == "__main__":
    main()
