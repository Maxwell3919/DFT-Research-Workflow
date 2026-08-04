"""Deterministic invented time-dependent-response metadata; no TDDFT calculation is run."""
from pathlib import Path

def mismatches(left, right):
    fields = ("perturbation", "observable", "geometry", "response_route")
    return {field: (left[field], right[field]) for field in fields if left[field] != right[field]}

def run(svg=None):
    reference = {"perturbation": "weak-x-kick", "observable": "dipole-x", "geometry": "isolated", "response_route": "real-time"}
    compatible = dict(reference)
    incompatible = dict(reference, observable="loss-q", geometry="periodic")
    result = {"fixture": "invented response metadata", "compatible_mismatches": mismatches(reference, compatible), "incompatible_mismatches": mismatches(reference, incompatible), "does_not_establish": "a TDDFT response, excitation, spectrum, convergence, lifetime, or material conclusion"}
    assert not result["compatible_mismatches"]
    assert set(result["incompatible_mismatches"]) == {"observable", "geometry"}
    if svg:
        Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"><title>Invented time-dependent response ledger</title><rect width="720" height="240" fill="white"/><text x="42" y="42" font-family="sans-serif" font-size="20">invented response metadata must match before comparison</text><rect x="70" y="80" width="260" height="105" rx="10" fill="#dbeafe"/><text x="91" y="113" font-family="sans-serif" font-size="16">same kick, dipole, isolated, route</text><text x="91" y="150" font-family="sans-serif" font-size="16">direct comparison permitted</text><rect x="390" y="80" width="260" height="105" rx="10" fill="#fee2e2"/><text x="411" y="113" font-family="sans-serif" font-size="16">different loss observable and cell</text><text x="411" y="150" font-family="sans-serif" font-size="16">direct comparison rejected</text><text x="100" y="220" font-family="sans-serif" font-size="15">matching labels do not prove a time-dependent response</text></svg>\n')
    return result

if __name__ == "__main__": print(run())
