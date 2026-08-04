"""Check the public CMR reaction/sign ledger used by the adsorption guide."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/cmr-co-fcc111-20260804.json"


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    record = json.loads(raw)
    source, scope, rows = record["source"], record["calculation_scope"], record["rows"]
    assert source["doi"] == "https://doi.org/10.1021/acs.jpcc.7b12258"
    assert source["license"] == "CC BY-SA 4.0"
    assert source["database_sha256"] == "2ea151bbf599868fb48d615b784f8bf9c82cac94f51baf85697e1c28e025e9bf"
    assert scope["reaction"] == "CO(g) + slab -> CO/slab"
    assert scope["sign_convention"] == "products minus reactants; negative is favourable"
    assert [row["surface"] for row in rows] == ["Cu", "Pd", "Pt", "Au"]
    assert rows[2]["PBE_adsorp_eV"] == -0.9462321972171281
    return {
        "fixture_type": "frozen public-data reaction ledger",
        "snapshot_sha256": hashlib.sha256(raw).hexdigest(),
        "reaction": scope["reaction"],
        "sign_convention": scope["sign_convention"],
        "coverage": scope["coverage"],
        "top_site_pbe_adsorption_eV": {row["surface"]: row["PBE_adsorp_eV"] for row in rows},
        "boundary": "Checks an attributed CMR extraction only; no DFT rerun, gas/free-energy correction, coverage series, site search, slab convergence, or catalytic/material conclusion.",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
