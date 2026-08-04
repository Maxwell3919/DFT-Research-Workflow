"""Reconstruct a bounded interface contact/separation ledger from a published Al/TiN table."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

DATA = Path(__file__).with_name("data") / "al-tin-interface-adhesion-2015.json"


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    data = json.loads(raw)
    assert data["source"]["doi"] == "https://doi.org/10.1103/PhysRevB.91.165413"
    assert data["source"]["table"] == "Table 2"
    assert data["source"]["units"] == "eV per interface cell"
    assert len(data["rows"]) == 7
    assert data["rows"][1]["adhesion_eV"] == -2.09
    assert data["rows"][3]["removal_eV"] == 0.8
    return {
        "schema_version": 1,
        "evidence_class": "derived-public-data",
        "material": "published Al/TiN contact-separation table",
        "source_doi": data["source"]["doi"],
        "source_preprint": data["source"]["preprint"],
        "source_table": data["source"]["table"],
        "source_snapshot_sha256": hashlib.sha256(raw).hexdigest(),
        "units": data["source"]["units"],
        "rows": data["rows"],
        "claim_boundary": "Published table reconstruction only; no interface geometry, DFT rerun, area normalization, convergence result, fracture energy, or new material conclusion.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    colors = ["#70808a", "#d45b45", "#704c8a"]
    points = []
    for index, row in enumerate(report["rows"]):
        x = 120 + abs(row["adhesion_eV"]) / 2.2 * 680
        y = 390 - row["removal_eV"] / 1.5 * 245
        points.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="9" fill="{colors[row["transferred_layers"]]}"/><text x="{x + 13:.1f}" y="{y + 5:.1f}" font-family="sans-serif" font-size="12">{index + 1}</text>')
    target.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="510" viewBox="0 0 960 510" role="img" aria-labelledby="t d"><title id="t">Published Al/TiN interface ledger</title><desc id="d">Seven published Al/TiN interface rows compare the magnitude of negative adhesion energy with reported Al-layer removal energy.</desc><rect width="960" height="510" fill="#fffdf8"/><text x="48" y="46" font-family="sans-serif" font-size="24" font-weight="700" fill="#172a3a">Al/TiN interface ledger from published Table 2</text><text x="48" y="72" font-family="sans-serif" font-size="14" fill="#52616b">Adhesion/interaction and removal quantities · eV per interface cell · no rerun</text><line x1="120" y1="390" x2="805" y2="390" stroke="#243746"/><line x1="120" y1="130" x2="120" y2="390" stroke="#243746"/>{''.join(points)}<text x="460" y="440" text-anchor="middle" font-family="sans-serif" font-size="15">|negative adhesion / interaction energy|</text><text x="26" y="260" transform="rotate(-90 26 260)" text-anchor="middle" font-family="sans-serif" font-size="15">Al-layer removal energy</text><text x="48" y="482" font-family="sans-serif" font-size="12" fill="#52616b">Labels 1–7 follow Feldbauer et al. Table 2; colours encode reported transferred layers.</text></svg>''',
        encoding="utf-8",
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    args = parser.parse_args()
    result = run()
    if args.svg:
        render_svg(result, args.svg)
    print(json.dumps(result, indent=2))
