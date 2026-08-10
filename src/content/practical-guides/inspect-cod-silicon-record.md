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

Open [COD entry 9013102](https://www.crystallography.net/cod/9013102.html). Confirm the entry number, formula, common name, unit-cell parameters, space group, publication record, and version history before downloading anything. These fields identify what the database says the record represents; they do not prove that it is the correct model for your calculation.

Use the **Coordinates** link labelled `9013102.cif` to download the CIF. Preserve the record URL, access date, original filename, and publication identity beside the file. A later `sha256sum 9013102.cif` can fix the downloaded byte identity, but a hash cannot establish the structure's scientific suitability.

## Read the CIF before converting it

Open the downloaded text in an editor. Locate the data block, cell lengths and angles, space-group fields, atom-site loop, fractional coordinates, occupancies, and any disorder or uncertainty fields. Compare them with the browser record. Stop if the formula, cell, symmetry, or site population disagree in a way you cannot explain.

The COD screenshot below is an actual public record state captured on 2026-08-10. It shows where the record identity, coordinate download, embedded structure preview, and publication metadata appear. It proves only that this interface and record were displayed at capture time.

## Rotate the structure and inspect periodic geometry

The second screenshot is an actual Mol* browser session loading this repository's expanded eight-site teaching snapshot derived from COD 9013102. The captured object is `public/examples/cif/silicon-cod-9013102-expanded.cif`, SHA-256 `c41b61624bccbf1a86b930d049aeabd2bfaa815c16bffa78c32183aab9f203bc`. Rotate the cell, turn the unit-cell outline on, inspect periodicity, and compare the visible atom count and arrangement with the text object you intended to load. The viewer state tree identifies the loaded object and representation.

This Mol* object is **not** the byte-for-byte raw COD download. It is the repository's expanded teaching snapshot, so use it to inspect the represented cell and to catch obvious geometry or conversion mistakes, not to claim raw-file identity. [Mol* documents the viewer URL/query interface](https://molstar.org/viewer-docs/query-parameters/).

For a desktop manual route, open the exact downloaded CIF in VESTA with **File > Open**. Show the unit-cell boundary, rotate along each lattice direction, inspect periodic images and coordination, and use the distance tool on suspiciously short contacts. For a slab or layered model, confirm which axis contains vacuum and view along the surface normal. The [VESTA documentation](https://jp-minerals.org/vesta/en/doc.html) describes these controls. No VESTA screenshot or local VESTA execution is claimed in this walkthrough.

Viewer bonds are display heuristics. Visual inspection can reveal a wrong cell, missing atom, unexpected contact, orientation error, or failed conversion; it does not replace symmetry checks, distance tables, occupancy review, or numerical model validation.

## Return with an inspected source object

Keep the raw CIF unchanged. Record any standardized, primitive, conventional, repeated, strained, or edited descendant as a new object with its transformation and software version. Reopen the descendant after conversion and compare it with the source view before preparing a DFT input.

Optional ASE or pymatgen parsing is useful after these human checks, especially for repeated transformations. It is not a substitute for reading the source record or looking at the resulting geometry.

## What this example does not establish

This walkthrough establishes an actual browser route to a declared COD record and an actual browser viewer state for a declared expanded teaching object. It does not prove database correctness, CIF-model suitability, symmetry standardization, absence of disorder, DFT readiness, numerical convergence, energetic stability, or any Silicon property.

## Official sources

- [Open and inspect COD entry 9013102](https://www.crystallography.net/cod/9013102.html)
- [Load a declared object through the Mol* Viewer query interface](https://molstar.org/viewer-docs/query-parameters/)
- [Open the exact CIF and inspect it with the VESTA manual](https://jp-minerals.org/vesta/en/doc.html)
