---
topic_slug: choose-dft-method-and-computational-setup
guide_slug: select-download-and-record-pseudopotentials
title: Select, Download, and Record Pseudopotentials
kind: implementation
tools:
  - quantum-espresso
  - python
status: reviewed
summary: Select a tested pseudopotential family, download the exact file, record its method identity and checksum, and hand it to model-specific convergence without treating a provider recommendation as acceptance.
tested_versions:
  - Quantum ESPRESSO 7.5 documented input format
  - Python 3.12 optional receipt checker
execution_script: examples/practical-guides/pseudopotential_receipt.py
source_ids:
  - qe-pw-75
  - qe-pseudopotential-portal
  - qe-upf-spec
  - sssp-paper
  - sssp-archive
  - pseudodojo-paper
media_ids: []
review: docs/reviews/2026-08-03-choose-dft-method-and-setup.md
reviewed_at: "2026-08-11"
---

## Purpose

This guide takes you from a scientific requirement to one exact local pseudopotential file and a reproducible receipt. It uses Quantum ESPRESSO UPF files as the reference implementation. The scientific workflow also applies to PAW datasets and other code-specific atomic data, but filenames, formats, licences, and compatibility rules differ.

A readable file is not an accepted pseudopotential. Selection establishes an identified candidate; the cutoff and target-observable studies establish only the numerical evidence that you actually run.

## Start in a clean working directory

Keep downloaded files separate from inputs and scratch data:

~~~bash
mkdir -p pp-study/{downloads,method,pseudo}
cd pp-study
pwd
~~~

Before opening a provider, write down:

- the elements and intended exchange-correlation treatment;
- whether semicore states are scientifically important;
- scalar-relativistic or fully relativistic treatment, including whether spin-orbit coupling will be used;
- the code and file format;
- the intended properties, pressure/volume range, oxidation or bonding environments, and accuracy target.

These are choices from the research question and method plan. They do not come from the filename.

## Choose a tested family in the provider interface

Open a maintained provider from [Tools & Resources](/DFT-Research-Workflow/tools/). Useful entry points include [SSSP](/DFT-Research-Workflow/tools/#resource-sssp), [PseudoDojo](/DFT-Research-Workflow/tools/#resource-pseudodojo), [PSlibrary](/DFT-Research-Workflow/tools/#resource-pslibrary), and [GBRV](/DFT-Research-Workflow/tools/#resource-gbrv). Use the provider's current documentation and release record, not an isolated file copied from an earlier calculation.

In the browser, select and record the following before download:

| Field | Where it comes from | What to do if absent |
| --- | --- | --- |
| Provider, family, and release | Provider page or release archive | Stop or record the release as unknown; do not invent it from the filename. |
| Exact filename | File link or download table | Copy it exactly, including capitalization and extension. |
| XC treatment | Provider metadata or file metadata | Reject an unexplained mismatch with the planned functional. |
| Valence and semicore configuration | Provider test table or file metadata | Treat it as unknown until an authoritative record is found. |
| NC, ultrasoft, or PAW type | Provider/file metadata | Check that the intended code and features support it. |
| Scalar or full relativity | Provider/file metadata | A spin-orbit calculation requires a compatible fully relativistic route. |
| Suggested wavefunction and charge-density cutoffs | Provider test record | Record them as starting points, not converged values. |
| Source URL, release date/version, licence, warnings | Provider record | Preserve the exact page and access date. |
| Provider checksum | Provider release record, when supplied | Compare it after download; also compute your own SHA-256. |

For a multi-element calculation, prefer a coherent tested family and compatible XC/relativity choices. Mixing datasets from different families is a method decision that needs an explicit reason and new compatibility/convergence evidence.

## Download the exact file

The human-first route is to click the chosen file in the provider interface, save it under `downloads/`, and confirm that the saved name is exact. If the provider exposes an inspected direct-download URL, the terminal equivalent is:

~~~bash
PSEUDO_FILE='COPY_THE_EXACT_PROVIDER_FILENAME'
PSEUDO_URL='PASTE_THE_EXACT_INSPECTED_DOWNLOAD_URL'

test "$PSEUDO_FILE" != 'COPY_THE_EXACT_PROVIDER_FILENAME'
test "$PSEUDO_URL" != 'PASTE_THE_EXACT_INSPECTED_DOWNLOAD_URL'
curl --fail --location --output "downloads/$PSEUDO_FILE" "$PSEUDO_URL"
~~~

Do not build download URLs by guessing a filename. If login, acceptance of a licence, or a code licence is required, use the provider's documented access path and do not publish restricted file contents.

## Inspect and fingerprint the local file

Run the checks before copying the file into a calculation:

~~~bash
test -s "downloads/$PSEUDO_FILE"
file "downloads/$PSEUDO_FILE"
wc -c "downloads/$PSEUDO_FILE"
sha256sum "downloads/$PSEUDO_FILE"
head -n 20 "downloads/$PSEUDO_FILE"
grep -Ei 'functional|relativistic|z_valence|wfc_cutoff|rho_cutoff' \
  "downloads/$PSEUDO_FILE" | head -n 30 || true
~~~

`sha256sum` identifies the bytes you downloaded. The text scan helps you locate metadata in a UPF file, but different UPF versions expose different fields. Compare what you observe with the provider record and the official UPF description; do not infer missing valence, relativity, or XC metadata from a filename.

If the provider published a checksum, compare it exactly. A mismatch means that the file is not the recorded artifact: re-download from the inspected source and investigate before continuing.

## Create the receipt

Create `method/pseudopotential-receipt.json` in a text editor. Replace every placeholder and copy the actual lowercase SHA-256 printed above. Use `null` only when the provider supplies no starting cutoff, and write an explicit `unknown - not stated by provider` for other missing text metadata.

~~~json
{
  "provider": "REPLACE_WITH_PROVIDER",
  "library_family": "REPLACE_WITH_FAMILY",
  "library_release": "REPLACE_WITH_RELEASE",
  "source_url": "COPY_EXACT_HTTPS_PROVIDER_URL",
  "accessed_at": "YYYY-MM-DD",
  "license": "REPLACE_WITH_LICENSE_OR_EXPLICIT_UNKNOWN",
  "filename": "COPY_THE_EXACT_PROVIDER_FILENAME",
  "sha256": "COPY_THE_64_CHARACTER_SHA256",
  "xc_functional": "REPLACE_WITH_PROVIDER_METADATA",
  "valence_configuration": "REPLACE_WITH_PROVIDER_METADATA",
  "relativistic_treatment": "REPLACE_WITH_PROVIDER_METADATA",
  "pseudopotential_type": "REPLACE_WITH_NC_US_OR_PAW",
  "provider_cutoff_starting_points_ry": {
    "ecutwfc": null,
    "ecutrho": null
  },
  "provider_warnings": [],
  "selection_reason": "REPLACE_WITH_THE_MODEL_REQUIREMENT"
}
~~~

Then bind the receipt to the calculation copy:

~~~bash
cp -- "downloads/$PSEUDO_FILE" "pseudo/$PSEUDO_FILE"
sha256sum "pseudo/$PSEUDO_FILE"
sha256sum -c <(printf '%s  %s\n' \
  "$(sha256sum "downloads/$PSEUDO_FILE" | awk '{print $1}')" \
  "pseudo/$PSEUDO_FILE")
~~~

The second command should print the file followed by `OK`. That proves byte identity between the two local copies; it does not prove that the provider metadata is correct or that the dataset is transferable.

## Put the exact file into a QE input

The third field of `ATOMIC_SPECIES` must be the exact staged filename. The example mass is part of the input record; it does not identify the pseudopotential bytes.

~~~qe
ATOMIC_SPECIES
Si  28.0855  COPY_THE_EXACT_PROVIDER_FILENAME
~~~

In `&CONTROL`, point `pseudo_dir` to the directory that contains that file. In `&SYSTEM`, set `ecutwfc` and `ecutrho` in Ry. A provider suggestion is an initial test point. The `pw.x` input reference documents a default `ecutrho = 4 * ecutwfc`, while also warning that ultrasoft, PAW, GGA, or vacuum-containing cases can need different ratios or higher charge-density cutoffs. Test the actual file and model instead of silently accepting the default or a fixed ratio.

Run a small preflight SCF with the intended code version, then inspect the beginning of the output for the code version, read pseudopotential identity, XC treatment, electron count, cutoffs, and any warning. Program startup only checks that this input reached the executable; it is not transferability or convergence evidence.

## Optional receipt checker

The optional repository helper has a deliberately narrow job:

- **Reads:** the receipt JSON and, when supplied, one local file.
- **Produces:** a JSON PASS/FAIL report on schema fields, filename, and SHA-256.
- **Checks:** field presence, date/URL/hash format, cutoff-field shape, and optional byte identity.
- **Does not check:** provider authenticity, metadata truth, QE compatibility, transferability, numerical convergence, or scientific validity.

Run its built-in fixture first, then check your receipt:

~~~bash
python3 examples/practical-guides/pseudopotential_receipt.py self-test
python3 examples/practical-guides/pseudopotential_receipt.py check \
  method/pseudopotential-receipt.json \
  --file "pseudo/$PSEUDO_FILE"
~~~

## Decide whether to continue

Continue to cutoff convergence only when all of these are true:

- the source, family, release, exact filename, licence, and hash are preserved;
- XC, valence/semicore, pseudopotential type, and relativistic treatment match the method plan;
- any provider warnings and feature restrictions have been inspected;
- the QE preflight reads the intended file without a fatal error;
- provider cutoffs remain labelled as starting points.

Stop and repair the provenance if the local hash changes, the provider record cannot be recovered, multiple files share an ambiguous nickname, or metadata conflicts. Stop and reconsider the method if the required valence or relativistic treatment is unavailable. If QE cannot read the file, first check the format, file integrity, path, permissions, and exact current manual; changing SCF parameters cannot repair a missing or incompatible file.

## Advanced branch: generate a pseudopotential

Generation is justified only for a specialized need such as a missing valence state, an unusual relativistic requirement, method development, or transferability research that tested libraries do not cover. It is not the default cure for an unfamiliar element or a difficult SCF.

Preserve the generator and version, full generator input, atomic reference configuration, XC and relativistic settings, local and nonlocal channel choices, and every output hash. Test atomic eigenvalues and scattering/logarithmic derivatives, search for ghost states, compare multiple chemically relevant configurations, and then test molecules or solids over the environments and volumes that matter. Finally compare against an all-electron or otherwise justified reference and repeat the solid-state cutoff and target-observable convergence studies. A generator reaching normal termination creates a candidate file, not an accepted dataset.

## Software bridges

The practical object changes by implementation, but the provenance questions remain. Use the current official entries collected in Tools & Resources for [VASP](/DFT-Research-Workflow/tools/#resource-vasp), [ABINIT](/DFT-Research-Workflow/tools/#resource-abinit), [CP2K](/DFT-Research-Workflow/tools/#resource-cp2k), and [FHI-aims](/DFT-Research-Workflow/tools/#resource-fhi-aims). VASP users must follow its licensed PAW access and official dataset guidance; ABINIT users can use its official pseudopotential guidance; CP2K and FHI-aims use different basis/potential or all-electron species objects. Do not rename those objects into a fictitious common file format.

## Next

Carry the exact staged file and receipt into [Converge Basis Cutoffs and Real-Space Grids](/DFT-Research-Workflow/operations/test-numerical-convergence/guides/converge-basis-cutoffs-and-grids/). Preserve the file hash in every later calculation record.

## Official sources

- [Quantum ESPRESSO 7.5 `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO pseudopotential portal](https://pseudopotentials.quantum-espresso.org/)
- [Quantum ESPRESSO Unified Pseudopotential Format](https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format)
- [SSSP pseudopotential verification study](https://doi.org/10.1038/s41524-018-0127-2)
- [Materials Cloud SSSP verification archive](https://archive.materialscloud.org/record/2021.76)
- [PseudoDojo training and grading protocol](https://doi.org/10.1016/j.cpc.2018.01.012)
