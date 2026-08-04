# Database access matrix — 2026-08-05

This is a transport audit, not a ranking of database quality or a claim that a
returned record is physically appropriate. HTTP probes and small response bodies
are retained under `examples/cases/database-cod-silicon/output/service-probes/`.
The tested commands use no credentials; `MP_API_KEY` was checked only for
presence and was absent.

| Service | Tested route and result | Web download | Direct URL / curl | REST / client | OPTIMADE | Bulk | Boundary |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Materials Project | `api.materialsproject.org/materials/summary/?material_ids=mp-149` → 401, no key | unverified | pending credential | pending credential | unverified | unverified | API-key route intentionally not attempted without a configured secret. |
| NOMAD | `prod/v1/optimade/v1/structures?...Si...` → 200, 31,638-byte JSON | unverified | tested through curl | unverified | tested | unverified | Query response is an access proof only; no NOMAD record is promoted to this case. |
| COD | `cod/9013102.cif` → 200, 5,234-byte CIF | unverified | tested | unverified | unverified | unverified | This is the complete terminal-first case below. |
| Materials Cloud | `archive.materialscloud.org/api/v1/` → 404 | unverified | unverified | unverified | unverified | unverified | A guessed API root returning 404 does not prove the service lacks an API. |
| JARVIS | `jarvis.nist.gov/api/jmaterials/?formula=Si` → 404 HTML | unverified | unverified | unverified | unverified | unverified | The tested guessed endpoint is not a verified API contract. |
| C2DB | `cmrdb.fysik.dtu.dk/c2db/row/` → 404 HTML | unverified | unverified | unverified | unverified | unverified | No C2DB access mode is asserted from this failed root probe. |
| OQMD | `oqmd.org/oqmdapi/formationenergy?composition=Si` → 200 JSON | unverified | tested | tested via this REST response | unverified | unverified | Response proves endpoint access, not field semantics, database completeness, or licence suitability. |
| AFLOW | `aflow.org/API/aflux/?species(Si),$paging(1),$format(json)` → 200 JSON | unverified | tested | tested via AFLUX response | unverified | unverified | Filter returned a real JSON response; semantic selection remains unreviewed. |
| OPTIMADE provider registry | `providers.optimade.org/providers.json` → 200 JSON | n/a | tested | n/a | tested | unverified | Registry discovery does not verify each provider's availability or data model. |

## COD case lineage

`database-cod-silicon` downloaded COD record `9013102` over HTTPS on Talos,
recorded raw SHA-256 `99fb6c6c297f8407aa779de46bf7eaa663ac079f7f12b582c042313f9c82f77e`,
and commits a deterministic public copy SHA-256
`cd12420b831cd62227a36865179d12c5eece74e4a40e8d135abc981ced42ca55`.
Only COD's upstream absolute repository metadata line is replaced;
the rule and both identities are stored beside the public copy.
The retrieval captured its HTTP 200 response headers and raw CIF, then ran the
installed `cif-structure-analysis` CLI and strict local parser on the public
copy.
The first proxy-mediated rerun ended at the TLS handshake; an isolated direct
TLS probe returned HTTP 200 and the same source hash, so `run.sh` explicitly
unsets only proxy variables for COD. This is a host-specific transport note,
not a general network recommendation.
