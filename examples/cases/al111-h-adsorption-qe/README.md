# Al(111) with one H candidate: QE SCF entry

This case constructs a periodic `2x2`, four-layer Al(111) slab with ASE, adds one
H atom at the initial `fcc` hollow candidate, and prepares one Quantum ESPRESSO
7.5 `scf` input.  The model is deliberately small and uses one candidate only.

It supports a recorded construction and a terminal-failure recovery for one
initial candidate.  The recorded Job 34 SCF was cancelled at its 10-minute
Slurm boundary before SCF convergence or normal QE completion.  It does **not**
compare sites, relax atoms, calculate a reference state, calculate an adsorption
energy, or establish a preferred adsorption site.

First run `python3 parse.py --prepare`.  On a host with the two hash-identified
PBE PAW PSL files available, use for example:

```bash
QE_PW=/path/to/pw.x \
QE_PSEUDO_DIR=/path/to/sssp-1.3.0/extracted \
QE_LAUNCHER='srun --ntasks=1 --cpus-per-task=1' \
bash run.sh
bash extract.sh
bash check.sh
```

`run.sh` refuses an already-existing `output/qe-run/`; preserve it as evidence
or move it deliberately before another execution.  No pseudopotential body is
stored in this repository: `source/pseudopotential-provenance.json` records only
public names, collection identity, and SHA-256 values.  At runtime, `run.sh`
uses an external `mktemp` directory with a temporary symlink to
`QE_PSEUDO_DIR`; scratch and any restart/WFC/save files are removed by its trap.
The case retains only a copied input, pseudo identity hashes, stdout, stderr,
and a small execution record.

The committed terminal record is generated deterministically by
`recover_execution.py` from the retained stdout/stderr.  It is historical
recovery evidence, not a successful replay.  `bash check.sh` deliberately exits
nonzero because G1 records the terminal execution failure.
