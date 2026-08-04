"""Deterministic invented quasiparticle metadata; no GW calculation is run."""
from pathlib import Path
def mismatches(a,b):
    fields=("starting_state","gw_scheme","screening_boundary","response_representation")
    return {f:(a[f],b[f]) for f in fields if a[f]!=b[f]}
def run(svg=None):
    a={"starting_state":"PBE","gw_scheme":"G0W0","screening_boundary":"truncated-2D","response_representation":"declared-A"}
    b=dict(a); c=dict(a,starting_state="hybrid",screening_boundary="periodic-3D")
    r={"fixture":"invented quasiparticle metadata","compatible_mismatches":mismatches(a,b),"incompatible_mismatches":mismatches(a,c),"does_not_establish":"GW, a quasiparticle energy, convergence, or a material conclusion"}
    assert not r["compatible_mismatches"] and set(r["incompatible_mismatches"])=={"starting_state","screening_boundary"}
    if svg: Path(svg).write_text('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="240"><title>Invented quasiparticle comparison ledger</title><rect width="720" height="240" fill="white"/><text x="42" y="42" font-family="sans-serif" font-size="20">invented QP metadata must match before comparison</text><rect x="70" y="80" width="260" height="105" rx="10" fill="#dbeafe"/><text x="92" y="115" font-family="sans-serif" font-size="16">same start, scheme, boundary, response</text><text x="92" y="151" font-family="sans-serif" font-size="16">comparison permitted</text><rect x="390" y="80" width="260" height="105" rx="10" fill="#fee2e2"/><text x="410" y="115" font-family="sans-serif" font-size="16">different start and boundary</text><text x="410" y="151" font-family="sans-serif" font-size="16">comparison rejected</text><text x="120" y="220" font-family="sans-serif" font-size="15">matching labels do not prove a GW quasiparticle result</text></svg>\n')
    return r
if __name__=='__main__': print(run())
