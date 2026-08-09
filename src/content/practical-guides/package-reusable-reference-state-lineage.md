---
topic_slug: calculate-reference-ground-state
guide_slug: package-reusable-reference-state-lineage
title: Package a Reusable Reference-State Lineage
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Bind structure, method, state, charge density, wavefunctions, outputs, and downstream compatibility into one hashed reference-state manifest.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/silicon_qe_convergence.py
source_ids:
  - qe-pw-75
  - vasp-electronic-ground-state-properties
  - vasp-lcharg
  - vasp-lwave
  - cp2k-dft
  - cod-9013102
media_ids:
  - reference-state-lineage
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

Charge-density and wavefunction files are useful only when their scientific identity remains attached. Package reusable artifacts as one reference-state lineage rather than as anonymous restart files.

## Audit the parent before packaging it

```bash
python3 examples/practical-guides/silicon_qe_convergence.py
```

This bounded command checks nine stored-output hashes, literal completion markers, and parsed energies. It does not create a reference manifest or verify any charge-density or wavefunction file.

Before registering a reusable parent, collect the exact structure checksum, fixed-geometry input, primary stdout/stderr, method and potential identity, charge/spin/occupation state, final diagnostics, numerical settings, software version, and hashes or retention references for every downstream artifact. Check that the intended target calculation expects the same structure, Hamiltonian, charge, state, and representation. If any state-defining field changes, create a new parent rather than reusing a readable but incompatible file.

The next action is not “copy the wavefunctions.” It is to record the compatible downstream request and the files it consumes, then preserve the reference as immutable evidence. Corrections create a new version and an explicit supersession link.

## Hash the state-defining objects

A minimal manifest binds:

```text
structure payload and checksum
method and potential identity
charge, spin, occupation, and state label
numerical settings
software and environment
SCF completion summary
energy convention
forces and stress
charge-density artifact
wavefunction artifact
primary output
parent and supersession links
```

The following manifest fixture is conceptual on this page. It illustrates payload
hashes and a compatibility decision, but it is not executed by the declared
companion:

```python
from reference_state_lineage_manifest import run

report = run()
print(report["manifest_digest"])
print(report["compatible_downstream_request"])
```

The declared companion does not create or validate that manifest. It checks the
expected SHA-256 values of nine stored QE outputs, requires literal completion
markers, and parses total energies. It does not verify input hashes, a potential,
charge density, wavefunctions, or downstream compatibility.

## Declare downstream compatibility

A downstream request should identify the expected structure, method, charge, and state. The script accepts a matching request and rejects one with a changed spin–orbit branch.

Compatibility can require more than matching file format. A file produced with another functional, potential set, charge, atom order, or state may be readable yet scientifically incompatible.

## Preserve large artifacts without copying them everywhere

Large electronic-state files may remain in scratch, archive, or code-specific repositories. The durable manifest can store content hash, size and format, canonical location or retention class, software version, regeneration parent, and expiration or deletion policy.

Before deleting a reproducible artifact, confirm that its parent inputs, environment, and regeneration path remain available.

## Version corrections rather than overwriting

If the reference state changes, create a new identity. Record why the previous state was superseded, which downstream calculations used it, and whether they require recomputation.

An immutable parent reference makes later provenance auditable. Silent replacement can mix target calculations derived from different electronic states.

## What this guide verifies

The declared companion checks stored-output identity, marker presence, and parsed
energies for a bounded fixed-geometry set. The manifest and compatibility logic
remain conceptual and are not execution evidence for this page. Nothing here
verifies inputs, publishes charge density or wavefunctions, validates a restart,
or establishes scientific compatibility.

## Common mistakes

**Saving only a wavefunction filename.** Preserve the structure, Hamiltonian, state, and generating calculation.

**Equating readable with compatible.** Validate state-defining metadata.

**Overwriting a corrected reference.** Create a new version and supersession link.

**Publishing restricted artifacts.** Keep licensed potentials, private outputs, and host details outside the public repository.

## Official sources

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP electronic ground-state properties](https://vasp.at/wiki/Electronic_ground-state_properties)
- [VASP `LCHARG`](https://vasp.at/wiki/LCHARG)
- [VASP `LWAVE`](https://vasp.at/wiki/LWAVE)
- [CP2K DFT section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html)
- [Crystallography Open Database entry 9013102](https://www.crystallography.net/cod/9013102.html)
