from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "examples/practical-guides/data/silicon-qe/convergence"
EXPECTED = {
    "si_e30_k6.out": "349854748a5288dcd27704797bf4e63ee86414b802591dd3b2d4738c234b86b5",
    "si_e30_k8.out": "3f70ca07183b77ac0e2322077b0d3d3fe929fcda9710afa37840ca3c0e3ef2a7",
    "si_e30_k10.out": "8b5424b52f08ebb1e079f0293d6c03c599e05c6737e8ee6d17e6bffd975290e6",
    "si_e40_k6.out": "cebd59aa635954352dd07a4f4150d4db50901a66b4e2df01f50c80e5aaa772ea",
    "si_e40_k8.out": "d4abab49a805fb8a7808e0f82dc4dcbf1548d3c7482b726c66c266fd84c0d6c2",
    "si_e40_k10.out": "943502816834623b7ffdbaff75300208a0a296ab9613e9dc5c46a45ee133a4eb",
    "si_e50_k6.out": "31ad9449e0dcb920942c2e2eae6091e85187dafb9b70941a686ea58d3ed9337f",
    "si_e50_k8.out": "94d7173a584cd2b8c4dcc181a3fb02c2553bdb1db60577725f0c724b1ca0348d",
    "si_e50_k10.out": "4593e3586e535581d5035765dc74654d2946ad62887e340b2105dec768fc6b2d",
}


def _sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run() -> dict[str, object]:
    rows = []
    for name, expected in EXPECTED.items():
        path = DATA / name
        assert _sha(path) == expected, f"hash mismatch: {name}"
        text = path.read_text(encoding="utf8")
        assert "convergence has been achieved" in text and "JOB DONE" in text
        energy = float(re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", text)[-1])
        ecut, mesh = map(int, re.match(r"si_e(\d+)_k(\d+).out", name).groups())
        rows.append({"ecutwfc_Ry": ecut, "k_mesh": mesh, "energy_Ry": energy, "file": name})
    rows.sort(key=lambda row: (row["ecutwfc_Ry"], row["k_mesh"]))
    reference = next(row for row in rows if row["ecutwfc_Ry"] == 50 and row["k_mesh"] == 10)
    for row in rows:
        row["delta_to_50Ry_10cubed_mRy"] = (row["energy_Ry"] - reference["energy_Ry"]) * 1000
    return {
        "material": "COD 9013102 silicon primitive cell",
        "software": "Quantum ESPRESSO 7.5 pw.x",
        "pseudopotential_sha256": "ae3aefd0811f9499dbc4a72f1f9ae02ef4fc7f3568bf6f559b68668719c69e2b",
        "rows": rows,
        "reference_row": reference,
        "all_runs_electronically_converged": True,
        "boundary": "A bounded 3 by 3 teaching matrix only. It does not establish a transferable cutoff, a converged force/stress or band observable, experimental agreement, or a material conclusion.",
    }


def _svg(report: dict[str, object], output: Path, mode: str) -> None:
    rows = report["rows"]
    assert isinstance(rows, list)
    if mode == "cutoff":
        groups = {k: [r for r in rows if r["k_mesh"] == k] for k in (6, 8, 10)}
        title, xkey, label = "Actual Silicon QE cutoff matrix", "ecutwfc_Ry", "wavefunction cutoff (Ry)"
    else:
        groups = {e: [r for r in rows if r["ecutwfc_Ry"] == e] for e in (30, 40, 50)}
        title, xkey, label = "Actual Silicon QE k-mesh matrix", "k_mesh", "cubic k mesh"
    colors = ["#2b6f8c", "#a33d2d", "#5c7d46"]
    lines = []
    for color, (key, group) in zip(colors, groups.items()):
        group.sort(key=lambda r: r[xkey])
        points = " ".join(f"{140 + 62*(r[xkey]-min(x[xkey] for x in rows))}:{390 - 24*r['delta_to_50Ry_10cubed_mRy']}" for r in group)
        points = points.replace(":", ",")
        lines.append(f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="4"/><text x="730" y="{160+30*len(lines)}" font-family="sans-serif" font-size="16" fill="{color}">{key}</text>')
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="520" viewBox="0 0 1000 520" role="img" aria-labelledby="t d"><title id="t">{title}</title><desc id="d">Nine actual Quantum ESPRESSO Silicon SCF total energies, plotted relative to the 50 Ry, ten by ten by ten mesh row.</desc><rect width="1000" height="520" fill="#f8f5ee"/><text x="70" y="55" font-family="sans-serif" font-size="27" font-weight="700" fill="#172a3a">{title}</text><text x="70" y="82" font-family="sans-serif" font-size="15" fill="#52616b">QE 7.5 · COD 9013102 · one fixed teaching structure · 9 electronically converged SCF runs</text><path d="M140 110V410H760" fill="none" stroke="#243746" stroke-width="3"/><text x="440" y="465" text-anchor="middle" font-family="sans-serif" font-size="17">{label}</text><text x="38" y="270" transform="rotate(-90 38 270)" text-anchor="middle" font-family="sans-serif" font-size="17">E − E(50 Ry, 10³) (mRy/cell)</text>{''.join(lines)}<text x="790" y="130" font-family="sans-serif" font-size="16" font-weight="700">fixed series</text><text x="500" y="505" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#52616b">Teaching evidence only: no force/stress, band, DOS, or experimental convergence claim.</text></svg>''', encoding="utf8")


if __name__ == "__main__":
    report = run()
    public = ROOT / "public/media/practical-guides/test-numerical-convergence"
    _svg(report, public / "converge-basis-cutoffs-and-grids/silicon-qe-cutoff-matrix.svg", "cutoff")
    _svg(report, public / "converge-k-points-and-smearing/silicon-qe-kmesh-matrix.svg", "mesh")
    print(json.dumps(report, indent=2))
