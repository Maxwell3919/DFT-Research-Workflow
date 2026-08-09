# Silicon ground-state and electronic-structure evidence chain

This terminal-first teaching case assembles separately recorded, hash-bound real
Quantum ESPRESSO 7.5 stages for the two-atom diamond-Si primitive cell derived
from COD 9013102. It does not claim that one historical launcher executed every
stage continuously or that the unpublished save trees are available. It
preserves the public inputs and outputs needed to inspect a 3 by 3 cutoff/
k-mesh matrix, fixed-cell relaxation, a restart pair, SCF, line-path bands,
uniform-mesh NSCF plus `dos.x`, Gamma-point phonons, and Gamma-point
`epsil=.true.` response.

The model is PBE with the scalar-relativistic ultrasoft
`Si.pbe-n-rrkjus_psl.1.0.0.UPF` identified by filename, exact member path,
byte count, and SHA-256 in `source/pseudopotentials.json`. The UPF body is
not redistributed. The acquisition route is the official Materials Cloud SSSP
v1.3.0 PBE precision archive; the preparation script requires the exact archive
byte count and SHA-256, cross-checks the publisher-listed MD5, extracts only the
declared regular member, and rejects any same-name file whose bytes do not match
the recorded member SHA-256.
The fixed 8 by 8 by 8 SCF uses 40 Ry / 320 Ry wavefunction/charge-density
cutoffs, and the DOS NSCF uses 12 by 12 by 12.  These are recorded settings,
not transferable recommendations.

Prepare the exact declared two-site primitive geometry and pseudopotential
outside the repository:

```bash
python3 -m venv .venv
.venv/bin/pip install -r requirements-practical.txt

case_root=examples/cases/silicon-ground-state-electronic-structure
prepared=/absolute/path/outside/the/repository/silicon-prepared
.venv/bin/python "$case_root/prepare-replay.py" \
  --download-pseudopotential \
  --output-dir "$prepared"

cat "$prepared/model/si-primitive-qe.inc"
sha256sum "$prepared/pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF"
```

The script requires the public CIF SHA-256, conventional eight-site Si cell,
`Fd-3m` space group 227 at `symprec=1e-5`, four-to-one volume ratio,
two-site primitive multiplicities, canonical cell and positions, and agreement
with the case SCF/bands/DOS geometry blocks. The generated model is
`NOT_RANKED`: this representation bridge is not a relaxation, stability
calculation, or proof that any method or numerical parameter is suitable.

Run the byte-checked reconstruction and acceptance checks:

```bash
bash replay-derived.sh
bash extract.sh
bash check.sh
```

`run.sh` is a native replay template assembled from the recorded stage inputs;
it is not claimed as the missing historical launcher. It includes the corrected
SCF -> `bands` -> `bands.x` ancestry for the directory named `full-zone/`. It
accepts `QE_PW`, `QE_BANDS`, `QE_DOS`, `QE_PH`, `QE_LAUNCHER`, `PSEUDO_DIR`,
and `RUNTIME_DIR`
only where a separately supplied potential is staged; it intentionally stops
before execution unless a separately obtained UPF with the
declared hash is supplied at `pseudo/Si.pbe-n-rrkjus_psl.1.0.0.UPF`; it never
uses a redistributed potential. `derived/full-zone-status.json` and its table
are reconstructed directly from the 260-point, eight-band raw data. The nominal
8x8x8 automatic grid used `nosym=.true.` but did not set `noinv=.true.`, so QE
retained time-reversal equivalence and printed a 260-point time-reversal-reduced
sample rather than a 512-point enumeration. It is not a converged gap result.

```bash
PSEUDO_DIR="$prepared/pseudo" \
RUNTIME_DIR=/absolute/path/outside/the/repository/silicon-runtime \
QE_LAUNCHER='mpirun -np 4' \
bash "$case_root/run.sh"
```

The six gates are deliberately independent.  Completed QE markers and parser
success support stored-output provenance, not cutoff/k-mesh/DOS/phonon/
dielectric convergence, a fundamental band gap, stability, or experimental
agreement.
