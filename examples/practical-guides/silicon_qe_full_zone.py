"""Validate and redraw the hash-bound Silicon QE path/full-zone teaching sample."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe/full-zone/full-zone-extrema.json"
PATH_BANDS = ROOT / "examples/practical-guides/data/silicon-qe/output/si.bands.dat"
PATH_SHA256 = "4903acde7e33eb79906fbcf72e3ea9f5d19593f65b3946818febf36678b6cc3f"


def run(svg: Path | None = None) -> dict[str, object]:
    record = json.loads(DATA.read_text(encoding="utf8"))
    assert hashlib.sha256(PATH_BANDS.read_bytes()).hexdigest() == PATH_SHA256
    path, mesh = record["path_sample"], record["full_zone_sample"]
    assert path["kpoint_count"] == 141 and mesh["kpoint_count"] == 260 and mesh["band_count"] == 8
    assert path["vbm_eV"] == mesh["vbm_eV"] == 6.205
    assert path["sampled_separation_eV"] == 0.574 and mesh["sampled_separation_eV"] == 0.617
    if svg:
        svg.parent.mkdir(parents=True, exist_ok=True)
        svg.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="500" viewBox="0 0 1000 500" role="img" aria-labelledby="title desc"><title id="title">Silicon QE path and mesh sampled band separations</title><desc id="desc">Original comparison of a 141-point QE band path and a 260-point symmetry-expanded 8 by 8 by 8 QE mesh for the same COD Silicon teaching cell. The two sampled separations differ and neither is converged.</desc><rect width="1000" height="500" fill="#f8f5ee"/><text x="55" y="55" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">One path and one mesh are both samples, not a fundamental gap</text><text x="55" y="83" font-family="sans-serif" font-size="15" fill="#52616b">COD 9013102 Silicon · QE 7.5 / bands.x · real output, reconstructed from hashes</text><line x1="110" y1="390" x2="910" y2="390" stroke="#263746" stroke-width="2"/><rect x="250" y="160" width="180" height="230" fill="#2b6f8c"/><rect x="610" y="144" width="180" height="246" fill="#d45b45"/><text x="340" y="145" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#172a3a">{path['sampled_separation_eV']:.3f} eV</text><text x="700" y="129" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#172a3a">{mesh['sampled_separation_eV']:.3f} eV</text><text x="340" y="425" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#172a3a">141-point band path</text><text x="700" y="425" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#172a3a">260-point 8×8×8 mesh</text><text x="500" y="470" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#52616b">Different sampling and an untested mesh: do not read either value as a converged fundamental, optical, or experimental gap.</text></svg>''', encoding="utf8")
    return {"material": record["material"], "software": record["software"], "path_kpoints": path["kpoint_count"], "mesh_kpoints": mesh["kpoint_count"], "path_sampled_separation_eV": path["sampled_separation_eV"], "mesh_sampled_separation_eV": mesh["sampled_separation_eV"], "boundary": record["claim_boundary"]}


if __name__ == "__main__":
    print(json.dumps(run(ROOT / "public/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/silicon-qe-path-full-zone.svg"), indent=2))
