"""Deterministic invented optical-spectrum metadata ledger; no response calculation is run."""
from pathlib import Path


def comparable(left, right):
    fields = ("component", "energy_reference", "broadening_label", "normalization")
    return {field: (left[field], right[field]) for field in fields if left[field] != right[field]}


def run(svg=None):
    reference = {"component": "xx", "energy_reference": "VBM", "broadening_label": "declared-A", "normalization": "3D-cell"}
    compatible = dict(reference)
    incompatible = dict(reference, component="zz", normalization="sheet")
    result = {
        "fixture": "invented optical-spectrum metadata",
        "compatible_mismatches": comparable(reference, compatible),
        "incompatible_mismatches": comparable(reference, incompatible),
        "does_not_establish": "a dielectric function, optical matrix element, convergence, lifetime, exciton, or material spectrum",
    }
    assert not result["compatible_mismatches"]
    assert set(result["incompatible_mismatches"]) == {"component", "normalization"}
    if svg:
        Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"><title>Invented optical-spectrum comparison ledger</title><rect width="720" height="240" fill="white"/><text x="42" y="42" font-family="sans-serif" font-size="20">invented spectral metadata must match before comparison</text><rect x="70" y="80" width="260" height="105" rx="10" fill="#dbeafe"/><text x="93" y="113" font-family="sans-serif" font-size="17">same: xx, VBM, declared-A, 3D</text><text x="93" y="150" font-family="sans-serif" font-size="17">pointwise comparison permitted</text><rect x="390" y="80" width="260" height="105" rx="10" fill="#fee2e2"/><text x="410" y="113" font-family="sans-serif" font-size="17">different: zz and sheet</text><text x="410" y="150" font-family="sans-serif" font-size="17">direct comparison rejected</text><text x="108" y="220" font-family="sans-serif" font-size="15">matching metadata does not prove a calculated optical response</text></svg>\n')
    return result


if __name__ == "__main__":
    print(run())
