from __future__ import annotations

import json


IMMUTABLE_FIELDS = [
    "structure_checksum",
    "functional",
    "pseudopotential_hashes",
    "dispersion",
    "hubbard_parameters",
    "relativistic_treatment",
    "total_charge",
    "electrostatic_boundary",
]


def run() -> dict[str, object]:
    """Check a deterministic optimization-to-reference protocol transition."""
    optimization_record = {
        "structure_checksum": "sha256:final-geometry-fixture",
        "functional": "PBE",
        "pseudopotential_hashes": {"Si": "sha256:si-fixture"},
        "dispersion": "none",
        "hubbard_parameters": {},
        "relativistic_treatment": "scalar-relativistic",
        "total_charge": 0,
        "electrostatic_boundary": "three-dimensional-periodic",
        "wavefunction_cutoff": 60,
        "charge_density_cutoff": 480,
        "k_mesh": [6, 6, 6],
        "scf_threshold": 1.0e-8,
        "geometry_mode": "optimized",
    }
    reference_protocol = {
        **optimization_record,
        "wavefunction_cutoff": 80,
        "charge_density_cutoff": 640,
        "k_mesh": [10, 10, 10],
        "scf_threshold": 1.0e-10,
        "geometry_mode": "fixed",
        "calculation": "scf",
        "requested_outputs": ["energy", "forces", "stress", "charge_density"],
    }
    declared_refinements = {
        key: [optimization_record[key], reference_protocol[key]]
        for key in ["wavefunction_cutoff", "charge_density_cutoff", "k_mesh", "scf_threshold"]
    }

    changed_immutable = [
        key for key in IMMUTABLE_FIELDS
        if optimization_record[key] != reference_protocol[key]
    ]
    assert changed_immutable == []
    assert reference_protocol["geometry_mode"] == "fixed"
    assert reference_protocol["calculation"] == "scf"
    assert set(declared_refinements) == {
        "wavefunction_cutoff",
        "charge_density_cutoff",
        "k_mesh",
        "scf_threshold",
    }

    return {
        "fixture": "deterministic protocol metadata; no electronic calculation",
        "method_identity_preserved": True,
        "changed_immutable_fields": changed_immutable,
        "declared_refinements": declared_refinements,
        "fixed_geometry": True,
        "requested_outputs": reference_protocol["requested_outputs"],
        "boundary": (
            "metadata continuity test only; no DFT execution, validated settings, "
            "SCF convergence, or ground-state claim"
        ),
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
