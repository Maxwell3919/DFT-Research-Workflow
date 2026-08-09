# Review — Document and Preserve the Study

## Scope and semantic review

The article treats preservation as an identity-bound study release rather than an indiscriminate copy of a scratch tree. It covers versioned identifiers, manifests and checksums, graph provenance, raw/derived/metadata/code separation, restricted and licensed assets, artifact selection, restart and format decisions, human and machine-readable metadata, repository roles, clean-environment restoration, and long-term fixity and migration.

The source roles are distinct. The FAIR paper supports findability, accessibility under stated conditions, interoperability, reusability, machine actionability, and application to data, software, and workflows. The AiiDA and Materials Cloud papers support calculation/data provenance graphs and reusable computational records. RO-Crate supports aggregation and JSON-LD description of research objects. RFC 8493 supports payload and tag manifests and checksum validation for transport packages. DataCite supplies a maintained metadata-schema authority for citable research objects.

The article explicitly separates a stable identifier from a checksum, fixity from authenticity, storage from provenance, workflow capture from scientific acceptance, restart recovery from portable reconstruction, deposit from restore, and reproducibility from scientific validity. It prescribes no universal directory layout, retention period, storage quota, checksum cadence, repository, file format, or software stack.

## Source and rendering record

- [Wilkinson and co-workers, FAIR Guiding Principles](https://doi.org/10.1038/sdata.2016.18)
- [Pizzi and co-workers, provenance graphs for computational science](https://doi.org/10.1016/j.commatsci.2015.09.013)
- [Talirz and co-workers, Materials Cloud provenance and reuse](https://arxiv.org/abs/2003.12510)
- [RO-Crate 1.1 specification](https://www.researchobject.org/ro-crate/specification/1.1/introduction.html)
- [RFC 8493, the BagIt File Packaging Format](https://datatracker.ietf.org/doc/rfc8493/)
- [DataCite Metadata Schema](https://schema.datacite.org/)

The rendered topic must contain the same six URLs. Manifest validation checks exact article/review/source identity without network access; the external audit separately records time-bounded reachability.

## Practical-page and media decision

No new subordinate page or image is required. Existing practical companions already demonstrate lineage, hashes, deterministic fixtures, public-data derivation, and evidence boundaries for concrete observables. A universal archive generator would impose a false file layout and retention policy across unlike studies. A material-result screenshot would add visual realism but would not explain study preservation; provenance-bearing real-material images remain on the practical pages where their observable and execution context can be interpreted.

The page does not claim that a package has been deposited, that a DOI persists forever, that a checksum authenticates an author, that a backup is restorable without a restore test, or that reconstructed output establishes convergence, accuracy, physical validity, or a scientific conclusion.

## Batch 5A operational closure

The public topic now begins with the minimum recovery roles: README, source, inputs, commands, stdout/stderr and retained artifacts, parsed tables, figures plus plotted data, environment, manifest, and SHA-256 identities. Acceptance requires restoration into a new directory and regeneration of parsers and figures; a downloadable archive or passing checksum alone is insufficient.
