---
topic_slug: obtain-material-structure
guide_slug: inspect-cod-silicon-record
title: Inspect a Silicon Structure from Its COD Record
kind: worked-example
tools:
  - vesta
interfaces:
  - COD browser record
  - Mol* browser viewer
  - Text editor
status: reviewed
summary: Follow an actual COD Silicon record from browser metadata and CIF download through text and visual inspection without treating a viewer image as structural validation.
tested_versions:
  - COD entry 9013102 web record accessed 2026-08-10
  - Mol* Viewer web deployment accessed 2026-08-10
  - Google Chrome 149.0.7827.53
  - VESTA 3 official manual route; not executed in this walkthrough
source_ids:
  - cod-9013102
  - molstar-viewer-query-parameters
  - vesta-documentation
media_ids:
  - cod-9013102-browser-record
  - silicon-molstar-browser-viewer
review: docs/reviews/2026-08-10-cod-silicon-interface-walkthrough.md
reviewed_at: "2026-08-10"
---

## Start with the database record, not a detached file

Open [COD entry 9013102](https://www.crystallography.net/cod/9013102.html). Confirm the entry number, formula, common name, unit-cell parameters, space group, publication record, and version history before downloading anything. These fields identify what the database says the record represents; they do not prove that it is the correct phase or model for a calculation.

Use the **Coordinates** link labelled `9013102.cif`. Keep that download unchanged, and record the page URL, access date, original filename, publication identity, and any experimental conditions or disorder information. A checksum fixes the downloaded bytes; it does not establish phase identity or scientific suitability.

The Visual reference section on this page includes an actual capture of the public COD record. Use it to locate identity, coordinates, structure preview, and publication metadata. The capture proves only what the interface displayed on 2026-08-10.

## Read the exact CIF before converting it

Open the downloaded CIF in a text editor. Locate the data block, cell lengths and angles, space-group fields, atom-site loop, fractional coordinates, occupancies, and uncertainty or disorder fields. A terminal reader can use `head -n 40 9013102.cif`, `grep -n -E '^data_|^loop_|^_cell_|^_space_group_|^_symmetry_' 9013102.cif`, and `grep -n -E '^_atom_site_(label|type_symbol|fract_[xyz]|occupancy)' 9013102.cif`. These commands expose records; they do not validate the geometry.

Compare the text with the browser record. Stop if formula, cell, symmetry, or site population disagree in a way you cannot explain. Preserve any converted, standardized, primitive, conventional, or symmetry-expanded descendant under a new filename so that it cannot be mistaken for the download.

## Open the same object in a crystallographic viewer

For the desktop route, open the exact downloaded CIF in VESTA with **File > Open**. Show the unit-cell boundary, rotate along each lattice direction, inspect periodic images and coordination, and measure suspiciously short contacts. For a slab or layered object, view along the surface normal and confirm which axis contains the intended vacuum. The [VESTA documentation](https://jp-minerals.org/vesta/en/doc.html) describes these controls. No VESTA screenshot or local VESTA execution is claimed here.

The browser-viewer capture in the Visual reference section loads this site's expanded eight-site Silicon teaching snapshot, not the byte-for-byte COD download. Rotate it, inspect the object identity in the state tree, and compare the visible arrangement with the object you expected. [Mol* documents the viewer URL/query interface](https://molstar.org/viewer-docs/query-parameters/). Because this object is a derived `P 1` representation, it can demonstrate browser interaction and reveal an obvious display or conversion problem, but it cannot prove raw-file identity.

Viewer bonds are display heuristics. A plausible picture does not replace occupancy review, periodic distance checks, parser warnings, or tolerance-dependent symmetry analysis. If text and picture disagree, resolve the data block, symmetry expansion, disorder model, or conversion before continuing.

## Return with an inspected source object

Bring back the unchanged CIF, stable record identity, retrieval information, checksum, publication and conditions, notes from the text inspection, notes from the exact-file visual inspection, and any unresolved ambiguity. Reopen every derived file and compare it with the source before treating it as a model parent.

Continue with [Build or Modify a Computational Model](/DFT-Research-Workflow/operations/build-or-modify-computational-model/) only after the record, raw text, and represented geometry are mutually understandable. Model choices such as vacuum, supercell, defect, ordering, charge, or constraints belong to that next task.

## What this example does not establish

This walkthrough establishes an actual browser route to a declared COD record and an actual browser viewer state for a declared expanded teaching object. It does not prove database correctness, CIF-model suitability, symmetry standardization, absence of disorder, DFT readiness, numerical convergence, energetic stability, or any Silicon property.

## Official sources

- [Open and inspect COD entry 9013102](https://www.crystallography.net/cod/9013102.html)
- [Load a declared object through the Mol* Viewer query interface](https://molstar.org/viewer-docs/query-parameters/)
- [Open the exact CIF and inspect it with the VESTA manual](https://jp-minerals.org/vesta/en/doc.html)
