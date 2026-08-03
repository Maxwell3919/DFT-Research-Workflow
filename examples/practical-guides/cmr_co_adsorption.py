from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
from pathlib import Path


DATA = Path(__file__).with_name("data") / "cmr-co-fcc111-20260804.json"


def verify_source_database(source_db: Path) -> dict[str, object]:
    """Verify that the frozen rows still match the attributed CMR database."""
    record = json.loads(DATA.read_bytes())
    source_bytes = source_db.read_bytes()
    source_hash = hashlib.sha256(source_bytes).hexdigest()
    assert len(source_bytes) == record["source"]["database_bytes"]
    assert source_hash == record["source"]["database_sha256"]

    expected_by_id = {row["db_row_id"]: row for row in record["rows"]}
    placeholders = ",".join("?" for _ in expected_by_id)
    with sqlite3.connect(source_db) as connection:
        database_rows = connection.execute(
            f"SELECT id, key_value_pairs FROM systems WHERE id IN ({placeholders}) ORDER BY id",
            tuple(expected_by_id),
        ).fetchall()

    assert [row_id for row_id, _ in database_rows] == sorted(expected_by_id)
    source_keys = {
        "PBE_adsorp_eV": "PBE_adsorp",
        "RPBE_adsorp_eV": "RPBE_adsorp",
        "BEEFvdW_adsorp_eV": "BEEFvdW_adsorp",
        "RPA_EXX_adsorp_eV": "RPA_EXX_adsorp",
    }
    verified_fields = []
    for row_id, key_value_json in database_rows:
        source_row = json.loads(key_value_json)
        expected = expected_by_id[row_id]
        assert source_row["surf_mat"] == expected["surface"]
        assert source_row["adsorbate"] == expected["adsorbate"]
        for snapshot_key, source_key in source_keys.items():
            assert source_row[source_key] == expected[snapshot_key]
        verified_fields.append({"db_row_id": row_id, "surface": source_row["surf_mat"]})

    return {
        "database_sha256": source_hash,
        "database_bytes": len(source_bytes),
        "verified_rows": verified_fields,
        "verified_energy_fields": list(source_keys),
    }


def run() -> dict[str, object]:
    raw = DATA.read_bytes()
    record = json.loads(raw)
    rows = record["rows"]
    assert record["source"]["doi"] == "https://doi.org/10.1021/acs.jpcc.7b12258"
    assert record["source"]["license"] == "CC BY-SA 4.0"
    assert record["source"]["database_sha256"] == "2ea151bbf599868fb48d615b784f8bf9c82cac94f51baf85697e1c28e025e9bf"
    assert [row["surface"] for row in rows] == ["Cu", "Pd", "Pt", "Au"]
    assert [row["db_row_id"] for row in rows] == [109, 116, 124, 125]
    assert [row["PBE_adsorp_eV"] for row in rows] == [
        0.26296094060496955,
        -0.6815024201549509,
        -0.9462321972171281,
        0.10460172409057478,
    ]
    methods = ["PBE_adsorp_eV", "RPBE_adsorp_eV", "BEEFvdW_adsorp_eV", "RPA_EXX_adsorp_eV"]
    spreads = {
        row["surface"]: max(row[method] for method in methods) - min(row[method] for method in methods)
        for row in rows
    }
    assert all(row[method] > 0 for row in rows if row["surface"] in {"Cu", "Au"} for method in methods)
    assert all(row[method] < 0 for row in rows if row["surface"] in {"Pd", "Pt"} for method in methods)
    return {
        "fixture_type": "frozen public-data post-processing",
        "snapshot_sha256": hashlib.sha256(raw).hexdigest(),
        "source_database_sha256": record["source"]["database_sha256"],
        "reaction": record["calculation_scope"]["reaction"],
        "sign_convention": record["calculation_scope"]["sign_convention"],
        "methods": methods,
        "rows": rows,
        "method_spread_eV": spreads,
        "evidence_boundary": "The script verifies a frozen CMR extraction and original redraw. It does not rerun or independently validate the published PBE, RPBE, BEEF-vdW, or RPA calculations.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    rows = report["rows"]
    method_specs = [
        ("PBE_adsorp_eV", "PBE", "#2b6f8c", -18),
        ("RPBE_adsorp_eV", "RPBE", "#d45b45", -6),
        ("BEEFvdW_adsorp_eV", "BEEF-vdW", "#4f8555", 6),
        ("RPA_EXX_adsorp_eV", "RPA+EXX", "#704c8a", 18),
    ]
    x0, y0, width, height = 100, 95, 720, 330
    ymin, ymax = -1.1, 0.9
    sy = lambda value: y0 + (ymax - value) / (ymax - ymin) * height
    parts = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="570" viewBox="0 0 1000 570" role="img" aria-labelledby="title desc">',
        '<title id="title">Published CMR carbon monoxide adsorption benchmark</title>',
        '<desc id="desc">Original dot plot of PBE, RPBE, BEEF-vdW, and RPA plus exact-exchange adsorption energies for carbon monoxide on four full-coverage fcc 111 transition-metal surfaces.</desc>',
        '<rect width="1000" height="570" fill="#f8f5ee"/>',
        '<text x="55" y="48" font-family="sans-serif" font-size="25" font-weight="700" fill="#172a3a">CO on fcc(111): the method is part of the result</text>',
        f'<line x1="{x0}" y1="{y0}" x2="{x0}" y2="{y0+height}" stroke="#263746"/>',
        f'<line x1="{x0}" y1="{y0+height}" x2="{x0+width}" y2="{y0+height}" stroke="#263746"/>',
    ]
    for tick in [-1.0, -0.5, 0.0, 0.5]:
        y = sy(tick)
        stroke = "#8a969d" if tick == 0 else "#d9dfe2"
        sw = 2 if tick == 0 else 1
        parts += [f'<line x1="{x0}" y1="{y:.1f}" x2="{x0+width}" y2="{y:.1f}" stroke="{stroke}" stroke-width="{sw}"/>', f'<text x="{x0-12}" y="{y+5:.1f}" text-anchor="end" font-family="sans-serif" font-size="13" fill="#52616b">{tick:.1f}</text>']
    for index, row in enumerate(rows):
        x = x0 + 100 + index * 170
        for method, _label, color, offset in method_specs:
            value = row[method]
            parts.append(f'<circle cx="{x+offset}" cy="{sy(value):.1f}" r="8" fill="{color}"/>')
        parts += [f'<text x="{x}" y="{y0+height+28}" text-anchor="middle" font-family="sans-serif" font-size="17" fill="#263746">{row["surface"]}(111)</text>', f'<text x="{x}" y="{y0+height+49}" text-anchor="middle" font-family="sans-serif" font-size="12" fill="#52616b">spread {report["method_spread_eV"][row["surface"]]:.2f} eV</text>']
    for index, (_method, label, color, _offset) in enumerate(method_specs):
        lx = 180 + index * 190
        parts += [f'<circle cx="{lx}" cy="505" r="7" fill="{color}"/>', f'<text x="{lx+14}" y="511" font-family="sans-serif" font-size="15" fill="#263746">{label}</text>']
    parts += [
        '<text x="26" y="265" transform="rotate(-90 26 265)" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#263746">E_ads (eV per CO)</text>',
        '<text x="842" y="125" font-family="sans-serif" font-size="14" fill="#52616b">negative is favourable</text>',
        '<text x="842" y="148" font-family="sans-serif" font-size="14" fill="#52616b">for the CMR reaction</text>',
        '<text x="500" y="550" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">Original redraw of CMR CC BY-SA 4.0 data · DOI 10.1021/acs.jpcc.7b12258 · no DFT rerun</text>',
        '</svg>',
    ]
    target.write_text("".join(parts), encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--svg", type=Path)
    parser.add_argument(
        "--source-db",
        type=Path,
        help="optionally hash and compare the frozen rows against the downloaded CMR SQLite database",
    )
    args = parser.parse_args()
    result = run()
    if args.source_db:
        result["source_database_verification"] = verify_source_database(args.source_db)
    if args.svg:
        render_svg(result, args.svg)
    print(json.dumps(result, indent=2))
