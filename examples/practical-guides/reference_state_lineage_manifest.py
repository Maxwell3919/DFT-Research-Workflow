from __future__ import annotations

import hashlib
import json


def _sha256(payload: bytes) -> str:
    return f"sha256:{hashlib.sha256(payload).hexdigest()}"


def run() -> dict[str, object]:
    """Construct and verify a deterministic reference-state lineage manifest."""
    payloads = {
        "structure": b"fixture-structure-v1",
        "method": b"PBE|fixture-potential|scalar-relativistic|charge=0",
        "state": b"FM-A|occupation=smearing-fixture",
        "charge_density": b"fixture-charge-density-bytes",
        "wavefunction": b"fixture-wavefunction-bytes",
        "primary_output": b"fixture-output-summary",
    }
    hashes = {name: _sha256(payload) for name, payload in payloads.items()}
    manifest = {
        "schema_version": 1,
        "reference_state_id": "reference-state-fixture-v1",
        "structure_hash": hashes["structure"],
        "method_hash": hashes["method"],
        "state_hash": hashes["state"],
        "total_charge": 0,
        "state_label": "FM-A",
        "relativistic_treatment": "scalar-relativistic",
        "artifacts": {
            "charge_density": hashes["charge_density"],
            "wavefunction": hashes["wavefunction"],
            "primary_output": hashes["primary_output"],
        },
    }
    manifest_bytes = json.dumps(
        manifest, sort_keys=True, separators=(",", ":")
    ).encode()
    manifest_digest = _sha256(manifest_bytes)

    compatible_request = {
        "structure_hash": manifest["structure_hash"],
        "method_hash": manifest["method_hash"],
        "total_charge": 0,
        "state_label": "FM-A",
        "relativistic_treatment": "scalar-relativistic",
    }
    incompatible_request = {
        **compatible_request,
        "relativistic_treatment": "spin-orbit",
    }

    keys = [
        "structure_hash",
        "method_hash",
        "total_charge",
        "state_label",
        "relativistic_treatment",
    ]
    compatible = all(compatible_request[key] == manifest[key] for key in keys)
    incompatible = all(incompatible_request[key] == manifest[key] for key in keys)
    assert compatible
    assert not incompatible
    assert manifest_digest == _sha256(manifest_bytes)

    return {
        "fixture": "in-memory deterministic payloads; no real scientific artifact",
        "manifest_digest": manifest_digest,
        "artifact_hashes": manifest["artifacts"],
        "compatible_downstream_request": compatible,
        "changed_state_request_rejected": not incompatible,
        "boundary": (
            "hashing and declared-compatibility test only; no real charge density, "
            "wavefunction, restart validation, or scientific reuse claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
