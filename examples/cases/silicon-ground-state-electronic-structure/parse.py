#!/usr/bin/env python3
"""Strict, no-QE reconstruction of the stored Silicon QE 7.5 evidence."""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import shutil
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
SRC, INP, OUT, DER, FIG = (ROOT / name for name in ("source", "input", "output", "derived", "figures"))
UPSTREAM = "examples/practical-guides/data/silicon-qe"
EXPECTED = {
    "source/silicon-cod-9013102.cif": "99fb6c6c297f8407aa779de46bf7eaa663ac079f7f12b582c042313f9c82f77e",
    "source/pseudopotentials.json": "cd01fa4af67f1998b16b30cd40c0beabe80be0a20eb2e43fb713b244a8fe7893",
    "source/qe_plan.json": "75bd7ee6091b4ebf21d99f42ad81607977d6cc7a9e2366e42b89ce6f73ce6261",
    "source/full-zone-extrema.json": "2a30ebb89071af1b9aa5167547a5939ec3780be1c4722534704c165aaffd2ea3",
    "source/output-excerpt.txt": "c5a49549aeebaafca49944bbc72a4d1901c8812979151de9328d7bc2f573127a",
    "output/scf-main.out": "16567297a7394ea428f79e75ce4e2e2d821aa3ccf26d3d633e1e5de0ff5a484f",
    "output/bands-pw.out": "964d94760e0da901e613010304160e8cffc6d0a0e9e75701ad2b5fb0e7fb41de",
    "output/bandsx-main.out": "56234fe91b75190b2b83f28a2c4b978f6962b1050dd8440665d955132ac814ff",
    "output/si.bands.dat": "4903acde7e33eb79906fbcf72e3ea9f5d19593f65b3946818febf36678b6cc3f",
    "output/dos-nscf.out": "fee1adb51f1762cba08576b0eade9db159fa58a27e50308946e5fd10fe064b64",
    "output/dosx.out": "4e2f80adabf55a95c31b48de68f29c7c1fde5e8b60f451fa880526350bf95c5d",
    "output/si.dos.dat": "dc3bd84a740a572d665b3e39bdfb642dd61746e4c3c095ec18ae24ff96123db3",
    "output/si-relax.out": "546a5b13878429c434e3957b115eb620dcaa5f5464ab0492b690c66d0ec1fac7",
    "output/fresh.out": "86266d6cf5a38b86e3a3918c8c73e4d29a7d84c0b1771cb5c32d166bd4af64a5",
    "output/restart.out": "44743a2471b5714fb4799a447f0a615c7c6e8219e78044ce4c9963f66bd195eb",
    "output/segment1.out": "8ad09cca7e20d1872c0ef3d4c1e018dae65e4cc1c60052d70d812373dd24204b",
    "output/segment2-restart.out": "8c294032f4dc59db136957c90cb665f8ad376be5c3b4c4590257ec6ad1b7c421",
    "output/si-gamma-scf.out": "bfd2c08124f5a36a55095c3e60f529c190d15b2f14e07b5ea9458030c09d7614",
    "output/si-gamma-ph.out": "0cec5946997c8c20dfb9d2ac807ccb4db2985b1452650196b57a4ccfa0e7d0b3",
    "output/si-epsilon-scf.out": "604d40e7ba08e9fb4e5daf9a649dc21f8b06ddf45e5a901efb02843729f73ecb",
    "output/si-epsilon-ph.out": "4d77782884f40ef28402890a6a5efdaf375d73a41d646bf1926712d44470c931",
}
CONVERGENCE = {
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

def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path: Path, obj: object) -> None:
    path.write_text(json.dumps(obj, indent=2, sort_keys=True) + "\n", encoding="utf-8")

def require_hashes() -> None:
    for rel, expected in EXPECTED.items():
        actual = sha(ROOT / rel)
        assert actual == expected, f"hash mismatch for {rel}: {actual} != {expected}"
    for name, expected in CONVERGENCE.items():
        path = OUT / name
        assert sha(path) == expected, f"hash mismatch for {name}"
        assert sha(INP / name.replace(".out", ".in")) in (line.split()[0] for line in (SRC / "convergence-checksums.sha256").read_text(encoding="utf-8").splitlines()), f"input not bound by source checksum: {name}"
    fullzone_checksums = {line.split()[-1]: line.split()[0] for line in (SRC / "checksums.sha256").read_text(encoding="utf-8").splitlines() if line.strip()}
    for name in ("scf.in", "bands.in", "bands.x.in"):
        assert sha(INP / "full-zone" / name) == fullzone_checksums[name], f"full-zone input mismatch: {name}"
    for path in INP.rglob("*.in"):
        text = path.read_text(encoding="utf-8")
        if "ATOMIC_SPECIES" in text:
            assert "Si.pbe-n-rrkjus_psl.1.0.0.UPF" in text, f"unexpected input identity: {path}"
    for path in OUT.glob("*.out"):
        text = path.read_text(encoding="utf-8")
        assert "v.7.5" in text and text.count("JOB DONE.") == 1, f"incomplete QE record: {path.name}"

def total_energy(text: str) -> float:
    matches = re.findall(r"!\s+total energy\s+=\s+([-0-9.]+) Ry", text)
    assert matches, "no final total energy"
    return float(matches[-1])

def convergence_rows() -> list[dict[str, object]]:
    rows = []
    for name in sorted(CONVERGENCE):
        match = re.fullmatch(r"si_e(\d+)_k(\d+)\.out", name)
        assert match
        text = (OUT / name).read_text(encoding="utf-8")
        assert "convergence has been achieved" in text
        rows.append({"file": name, "ecutwfc_Ry": int(match.group(1)), "k_mesh": int(match.group(2)), "total_energy_Ry": total_energy(text)})
    ref = next(row for row in rows if row["ecutwfc_Ry"] == 50 and row["k_mesh"] == 10)
    for row in rows:
        row["delta_to_50Ry_10cubed_mRy_per_cell"] = round((row["total_energy_Ry"] - ref["total_energy_Ry"]) * 1000, 8)
    return rows

def parse_bands() -> list[dict[str, object]]:
    lines = (OUT / "si.bands.dat").read_text(encoding="utf-8").splitlines()[1:]
    assert len(lines) == 282
    rows = []
    distance = 0.0
    previous = None
    for index in range(0, len(lines), 2):
        k = [float(value) for value in lines[index].split()]
        e = [float(value) for value in lines[index + 1].split()]
        assert len(k) == 3 and len(e) == 8
        if previous is not None:
            distance += sum((a-b)**2 for a, b in zip(k, previous)) ** 0.5
        rows.append({"index": index // 2 + 1, "distance": distance, "kx": k[0], "ky": k[1], "kz": k[2], "energies_eV": e})
        previous = k
    assert len(rows) == 141
    return rows

def parse_dos() -> list[tuple[float, float, float]]:
    rows = []
    for line in (OUT / "si.dos.dat").read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"): continue
        fields = line.split()
        assert len(fields) >= 3
        rows.append((float(fields[0]), float(fields[1]), float(fields[2])))
    assert len(rows) > 100
    return rows

def parse_frequency(path: Path) -> list[float]:
    values = [float(value) for value in re.findall(r"freq \(\s*\d+\) =\s*[-0-9.]+ \[THz\] =\s*([-0-9.]+) \[cm-1\]", path.read_text(encoding="utf-8"))]
    assert len(values) >= 6
    return values[:6]

def dielectric_tensor() -> list[list[float]]:
    lines = (OUT / "si-epsilon-ph.out").read_text(encoding="utf-8").splitlines()
    start = next(i for i, line in enumerate(lines) if "Dielectric constant in cartesian axis" in line)
    tensor = []
    for line in lines[start + 1:]:
        nums = re.findall(r"[-+]?(?:\d+\.\d*|\.\d+|\d+)", line)
        if len(nums) == 3:
            tensor.append([float(value) for value in nums])
            if len(tensor) == 3: break
    assert len(tensor) == 3 and all(abs(tensor[i][i] - 14.026301123) < 1e-9 for i in range(3))
    return tensor

def render(rows: list[dict[str, object]], bands: list[dict[str, object]], dos: list[tuple[float, float, float]], phonons: list[float], epsilon: list[list[float]]) -> None:
    plt.style.use("seaborn-v0_8-whitegrid")
    fig, ax = plt.subplots(figsize=(7, 4.5))
    for mesh in (6, 8, 10):
        group = [row for row in rows if row["k_mesh"] == mesh]
        ax.plot([row["ecutwfc_Ry"] for row in group], [row["delta_to_50Ry_10cubed_mRy_per_cell"] for row in group], marker="o", label=f"{mesh}x{mesh}x{mesh}")
    ax.set(xlabel="ecutwfc (Ry)", ylabel="E - E(50 Ry, 10 cubed) (mRy/cell)", title="Stored Silicon QE 7.5 cutoff and k-mesh matrix")
    ax.legend(); fig.tight_layout(); fig.savefig(FIG / "convergence-matrix.png", dpi=160); plt.close(fig)
    fig, ax = plt.subplots(figsize=(7, 4.5))
    x = [row["distance"] for row in bands]
    for band in range(8): ax.plot(x, [row["energies_eV"][band] for row in bands], color="#155e92", linewidth=0.7)
    ax.axhline(0, color="black", linewidth=0.7, linestyle="--"); ax.set(xlabel="cumulative path coordinate", ylabel="eigenvalue (eV)", title="Stored line-path bands: solver warning retained")
    fig.tight_layout(); fig.savefig(FIG / "band-path.png", dpi=160); plt.close(fig)
    fig, ax = plt.subplots(figsize=(7, 4.5)); ax.plot([r[0] for r in dos], [r[1] for r in dos], color="#8a3b18")
    ax.set(xlabel="energy relative to Fermi level (eV)", ylabel="DOS", title="Stored 12x12x12 tetrahedron DOS")
    fig.tight_layout(); fig.savefig(FIG / "dos.png", dpi=160); plt.close(fig)
    fig, ax = plt.subplots(figsize=(7, 4.5)); ax.bar(range(1, 7), phonons, color="#4d7c0f", label="Gamma phonon")
    ax2 = ax.twinx(); ax2.plot([1, 2, 3], [epsilon[i][i] for i in range(3)], "o-", color="#7c3a97", label="epsilon diagonal")
    ax.set(xlabel="mode / Cartesian diagonal", ylabel="frequency (cm-1)", title="Stored Gamma-point phonon and electronic response")
    ax2.set_ylabel("dielectric tensor (dimensionless)"); fig.tight_layout(); fig.savefig(FIG / "gamma-response.png", dpi=160); plt.close(fig)

def artifact(role: str, rel: str, raw: str | None = None) -> dict[str, object]:
    path = ROOT / rel
    result: dict[str, object] = {"role": role, "path": rel, "sha256": sha(path), "bytes": path.stat().st_size}
    if raw: result["raw_sha256"] = raw
    return result

def materialize() -> dict[str, object]:
    require_hashes()
    shutil.rmtree(DER, ignore_errors=True); shutil.rmtree(FIG, ignore_errors=True); DER.mkdir(); FIG.mkdir()
    rows, bands, dos = convergence_rows(), parse_bands(), parse_dos()
    gamma = parse_frequency(OUT / "si-gamma-ph.out")
    epsilon_freq = parse_frequency(OUT / "si-epsilon-ph.out")
    epsilon = dielectric_tensor()
    with (DER / "convergence.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0]), lineterminator="\n"); writer.writeheader(); writer.writerows(rows)
    with (DER / "band-path.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n"); writer.writerow(["index", "distance", "kx", "ky", "kz", *[f"band_{i}_eV" for i in range(1,9)]])
        for row in bands: writer.writerow([row["index"], f'{row["distance"]:.9f}', row["kx"], row["ky"], row["kz"], *row["energies_eV"]])
    with (DER / "dos.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, lineterminator="\n"); writer.writerow(["energy_eV", "dos", "integrated_dos"]); writer.writerows(dos)
    fullzone = json.loads((SRC / "full-zone-extrema.json").read_text(encoding="utf-8"))
    fullzone_status = {"status": "RAW_OUTPUT_UNAVAILABLE", "recorded_ledger": fullzone, "required_missing_raw_files": ["scf.out", "bands-pw.out", "bandsx.out", "si-fullzone.bands.dat"], "boundary": "The source checksum ledger names these files, but they are absent from the public source tree. No full-zone numerical result is reconstructed or claimed."}
    write_json(DER / "full-zone-status.json", fullzone_status)
    report = {"case_id": "silicon-ground-state-electronic-structure", "model": {"formula": "Si", "structure": "two-atom diamond primitive cell derived from COD 9013102", "xc": "PBE", "relativity": "scalar", "pseudopotential": json.loads((SRC / "pseudopotentials.json").read_text(encoding="utf-8"))["pseudopotentials"][0]}, "software": {"Quantum ESPRESSO": "7.5"}, "recorded_settings": {"main_scf": {"ecutwfc_Ry": 40, "ecutrho_Ry": 320, "k_mesh": [8,8,8]}, "dos_nscf": {"k_mesh": [12,12,12], "occupations": "tetrahedra"}}, "execution_observations": {"nine_scf_matrix": "all stored pw.x outputs have one JOB DONE and an electronic convergence marker", "line_path_bands": "pw.x reached JOB DONE but contains three c_bands eigenvalue-not-converged warnings", "full_zone": fullzone_status["status"], "gamma_phonon_cm-1": gamma, "gamma_epsilon_phonon_cm-1": epsilon_freq, "dielectric_tensor": epsilon}, "gates": {"G0": "PASS", "G1": "PASS", "G2": "WARN", "G3": "WARN", "G4": "NOT TESTED", "G5": "NOT CLAIMED"}, "claim_boundary": "Stored public outputs demonstrate bounded execution and parsing lineage only. They do not establish convergence of any electronic, vibrational, or response observable; a band gap; stability; or experimental agreement."}
    write_json(DER / "observables.json", report)
    render(rows, bands, dos, gamma, epsilon)
    artifacts = [artifact("convergence_table", "derived/convergence.csv"), artifact("band_path_table", "derived/band-path.csv", EXPECTED["output/si.bands.dat"]), artifact("dos_table", "derived/dos.csv", EXPECTED["output/si.dos.dat"]), artifact("observable_report", "derived/observables.json"), artifact("full_zone_boundary", "derived/full-zone-status.json", EXPECTED["source/full-zone-extrema.json"]), artifact("figure", "figures/convergence-matrix.png"), artifact("figure", "figures/band-path.png"), artifact("figure", "figures/dos.png"), artifact("figure", "figures/gamma-response.png")]
    manifest = {"schema_version":"1.0", "case_id":"silicon-ground-state-electronic-structure", "title":"Silicon QE 7.5 ground-state and electronic-structure evidence chain", "case_kind":"worked-workflow", "evidence_class":"real-execution", "public_host_label":"Recorded public QE output; no host-private path retained", "started_at":None, "completed_at":"2026-08-05T00:06:24+08:00", "exit_code":0, "software":[{"name":"Quantum ESPRESSO","version":"7.5","interface":"pw.x, bands.x, dos.x, ph.x recorded output"},{"name":"Python","version":"3.12.11","interface":"stored-output parser"}], "sources":[{"id":"cod-9013102","role":"structure source","path":"source/silicon-cod-9013102.cif","sha256":EXPECTED["source/silicon-cod-9013102.cif"],"url":"https://www.crystallography.net/cod/9013102.html","accessed_at":"2026-08-04","licence_boundary":"COD source is retained as a public teaching copy."},{"id":"silicon-qe-pseudopotential-identity","role":"UPF identity only; no potential body","path":"source/pseudopotentials.json","sha256":EXPECTED["source/pseudopotentials.json"],"url":"https://www.materialscloud.org/discover/sssp/table/precision","accessed_at":"2026-08-04","licence_boundary":"Filename, declared source and SHA-256 are retained; the UPF body is absent."},{"id":"silicon-qe-plan","role":"recorded plan","path":"source/qe_plan.json","sha256":EXPECTED["source/qe_plan.json"]},{"id":"silicon-full-zone-ledger","role":"metadata boundary","path":"source/full-zone-extrema.json","sha256":EXPECTED["source/full-zone-extrema.json"]}], "commands":[{"stage":"replay stored evidence","command":"bash replay-derived.sh","exit_code":0},{"stage":"extract","command":"bash extract.sh","exit_code":0},{"stage":"acceptance","command":"bash check.sh","exit_code":0},{"stage":"native preflight without UPF","command":"bash run.sh","exit_code":2}], "artifacts":artifacts, "gates":{"G0":{"status":"PASS","summary":"copied public inputs/outputs and generated artifacts are SHA-256 checked against recorded source identities"},"G1":{"status":"PASS","summary":"stored QE 7.5 outputs each have one JOB DONE marker"},"G2":{"status":"WARN","summary":"SCF/relax/restart and Gamma response markers are present, but line-path bands retain c_bands eigenvalue-not-converged warnings"},"G3":{"status":"WARN","summary":"recorded downstream bands, DOS and Gamma artifacts parse; full-zone raw outputs named by the source ledger are unavailable"},"G4":{"status":"NOT TESTED","summary":"the 3 by 3 total-energy matrix has no accepted observable-specific stable-tail protocol; no DOS, phonon, dielectric, or band convergence evidence"},"G5":{"status":"NOT CLAIMED","summary":"no fundamental gap, physical stability, dielectric, phonon, or experimental-material conclusion is claimed"}}, "claim_boundary":{"supports":["Hash-bound reconstruction of the stored QE 7.5 teaching inputs, compact outputs and derived plots.","A documented missing-raw boundary for the full-zone ledger."],"does_not_support":["A transferable cutoff or k-mesh recommendation.","A converged band gap, DOS, phonon or dielectric observable.","Structural stability, physical validity, experimental agreement or a material conclusion."]}}
    write_json(ROOT / "manifest.json", manifest)
    return report

def validate_manifest() -> None:
    report = json.loads((DER / "observables.json").read_text(encoding="utf-8"))
    manifest = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))
    assert report["gates"]["G4"] == "NOT TESTED" and report["gates"]["G5"] == "NOT CLAIMED"
    assert manifest["gates"]["G2"]["status"] == "WARN"
    assert json.loads((DER / "full-zone-status.json").read_text(encoding="utf-8"))["status"] == "RAW_OUTPUT_UNAVAILABLE"
    for record in [*manifest["sources"], *manifest["artifacts"]]:
        path = ROOT / record["path"]; assert path.is_file() and sha(path) == record["sha256"], record["path"]

def main() -> None:
    parser = argparse.ArgumentParser(); parser.add_argument("--summary", action="store_true"); parser.add_argument("--check", action="store_true"); args = parser.parse_args()
    report = materialize(); validate_manifest()
    if args.check:
        print("PASS G0 SHA-256 lineage and required public artifacts")
        print("PASS G1 stored QE 7.5 terminal markers")
        print("WARN G2 band-path pw.x has retained c_bands eigenvalue warnings")
        print("WARN G3 full-zone raw outputs are unavailable; metadata boundary retained")
        print("NOT TESTED G4 no accepted observable-specific convergence protocol")
        print("NOT CLAIMED G5 no physical/material conclusion")
    else:
        print(json.dumps({"status":"PASS", "model":report["model"], "gates":report["gates"], "full_zone":report["execution_observations"]["full_zone"]}, indent=2, sort_keys=True))

if __name__ == "__main__": main()
