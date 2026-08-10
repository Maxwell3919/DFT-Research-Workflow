"""Reconstruct a bounded Silicon QE dielectric/Born-charge response ledger."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).parent / "data" / "silicon-qe"
DATA = ROOT / "dielectric"
STRUCTURE = ROOT / "silicon-cod-9013102.cif"
PSEUDOPOTENTIALS = ROOT / "pseudopotentials.json"
NUMBER = r"[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][-+]?\d+)?"
SCF_CONVERGENCE = re.compile(
    r"(?im)^\s+convergence has been achieved in\s+\d+\s+iterations\s*$"
)
ITERATIVE_CONVERGENCE = re.compile(r"(?im)^\s+convergence has been achieved\s*$")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def parse_matrix(lines: list[str], marker: str) -> list[list[float]]:
    start = next(index for index, line in enumerate(lines) if marker in line)
    matrix: list[list[float]] = []
    for line in lines[start + 1 :]:
        values = [float(value) for value in re.findall(NUMBER, line)]
        if len(values) == 3:
            matrix.append(values)
            if len(matrix) == 3:
                return matrix
    raise RuntimeError(f"matrix after {marker!r} was incomplete")


def parse_born_block(text: str, marker: str) -> list[dict[str, object]]:
    block = text.split(marker, 1)[1]
    block = block.split("Effective charges Sum", 1)[0]
    block = block.split("Representation #", 1)[0]
    atoms: list[dict[str, object]] = []
    atom_pattern = re.compile(r"atom\s+(\d+)\s+(\S+)\s+Mean Z\*:\s+(" + NUMBER + r")")
    positions = list(atom_pattern.finditer(block))
    for position, match in enumerate(positions):
        end = positions[position + 1].start() if position + 1 < len(positions) else len(block)
        atom_block = block[match.start() : end]
        rows = []
        for line in atom_block.splitlines():
            values = [float(value) for value in re.findall(NUMBER, line)]
            if len(values) == 3 and any(label in line for label in ("Ex", "Ey", "Ez", "E*x", "E*y", "E*z")):
                rows.append(values)
        if len(rows) != 3:
            raise RuntimeError(f"Born-charge rows missing for atom {match.group(1)}")
        atoms.append(
            {
                "atom": int(match.group(1)),
                "element": match.group(2),
                "mean": float(match.group(3)),
                "tensor": rows,
            }
        )
    if len(atoms) != 2:
        raise RuntimeError(f"expected two Born-charge entries, found {len(atoms)}")
    return atoms


def run() -> dict[str, object]:
    scf_input = DATA / "si-epsilon-scf.in"
    scf_output = DATA / "si-epsilon-scf.out"
    scf_error = DATA / "si-epsilon-scf.err"
    ph_input = DATA / "si-epsilon-ph.in"
    ph_output = DATA / "si-epsilon-ph.out"
    ph_error = DATA / "si-epsilon-ph.err"
    dynmat = DATA / "si_epsilon.dyn"
    scf_text = scf_output.read_text(encoding="utf-8")
    ph_text = ph_output.read_text(encoding="utf-8")
    assert "Program PWSCF v.7.5" in scf_text
    assert SCF_CONVERGENCE.search(scf_text)
    assert "JOB DONE." in scf_text
    assert "Program PHONON v.7.5" in ph_text
    assert "Dielectric constant in cartesian axis" in ph_text
    assert "Effective charges" in ph_text
    assert "JOB DONE." in ph_text

    dielectric = parse_matrix(ph_text.splitlines(), "Dielectric constant in cartesian axis")
    born_no_asr = parse_born_block(
        ph_text,
        "Effective charges (d Force / dE) in cartesian axis without acoustic sum rule applied (asr)",
    )
    born_asr = parse_born_block(
        ph_text,
        "Effective charges (d Force / dE) in cartesian axis with asr applied:",
    )
    assert all(abs(dielectric[index][index] - 14.026301123) < 1e-9 for index in range(3))
    assert all(abs(dielectric[row][column]) < 1e-8 for row in range(3) for column in range(3) if row != column)
    assert all(abs(atom["mean"] + 0.088) < 1e-6 for atom in born_no_asr)
    assert all(abs(atom["mean"]) < 1e-6 for atom in born_asr)

    pseudo = json.loads(PSEUDOPOTENTIALS.read_text(encoding="utf-8"))["pseudopotentials"][0]
    files = [scf_input, scf_output, scf_error, ph_input, ph_output, ph_error, dynmat]
    return {
        "schema_version": 1,
        "evidence_class": "real-execution",
        "material": {
            "formula": "Si",
            "structure_source": "COD 9013102",
            "structure_sha256": sha256(STRUCTURE),
        },
        "software": {"pw.x": "7.5", "ph.x": "7.5"},
        "workflow": "SCF followed by Gamma-point ph.x with epsil=.true. using the same prefix/outdir lineage",
        "q_point_fractional": [0.0, 0.0, 0.0],
        "response": {
            "dielectric_tensor": dielectric,
            "dielectric_kind": "electronic/ion-clamped tensor reported by ph.x epsil=.true.",
            "born_effective_charges_without_asr": born_no_asr,
            "born_effective_charges_with_asr": born_asr,
            "units": {"dielectric": "dimensionless", "born_effective_charge": "e"},
        },
        "completion": {
            "scf_exit_code": 0,
            "ph_exit_code": 0,
            "scf_job_done_markers": scf_text.count("JOB DONE."),
            "ph_job_done_markers": ph_text.count("JOB DONE."),
            "scf_convergence_markers": len(SCF_CONVERGENCE.findall(scf_text)),
            "dfpt_convergence_markers": len(ITERATIVE_CONVERGENCE.findall(ph_text)),
        },
        "pseudopotential": {
            "filename": pseudo["filename"],
            "sha256": pseudo["sha256"],
            "source": pseudo["source"],
            "source_url": pseudo["source_url"],
            "xc_functional": pseudo["xc_functional"],
            "relativistic": pseudo["relativistic"],
        },
        "files_sha256": {path.name: sha256(path) for path in files},
        "convergence_status": "SCF and DFPT response iterations reported completion markers; no dielectric cutoff, k-mesh, q-mesh, or observable convergence series was run.",
        "claim_boundary": "One QE 7.5 Gamma-point DFPT response for the fixed COD Silicon structure. It reports an electronic/ion-clamped dielectric tensor and Born-charge diagnostic; it is not a static dielectric including ionic lattice contributions, a phonon dispersion, a converged material response, experimental agreement, or a new material conclusion.",
    }


def render_svg(report: dict[str, object], target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    tensor = report["response"]["dielectric_tensor"]
    labels = ["xx", "yy", "zz"]
    bars = []
    for index, label in enumerate(labels):
        value = tensor[index][index]
        height = value / 15.0 * 210
        x = 120 + index * 120
        bars.append(
            f'<rect x="{x}" y="{310 - height:.1f}" width="48" height="{height:.1f}" fill="#3867d6"/><text x="{x + 24}" y="335" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#243746">{label}</text><text x="{x + 24}" y="{300 - height:.1f}" text-anchor="middle" font-family="sans-serif" font-size="13" fill="#243746">{value:.6f}</text>'
        )
    means = report["response"]["born_effective_charges_without_asr"]
    asr = report["response"]["born_effective_charges_with_asr"]
    rows = []
    for atom, corrected in zip(means, asr):
        rows.append(
            f'<text x="535" y="{125 + (atom["atom"] - 1) * 78}" font-family="sans-serif" font-size="15" fill="#243746">Si atom {atom["atom"]}: no ASR mean {atom["mean"]:.5f} e → ASR mean {corrected["mean"]:.5f} e</text>'
        )
    target.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="430" viewBox="0 0 960 430" role="img" aria-labelledby="title desc"><title id="title">Silicon QE dielectric and Born-charge response</title><desc id="desc">Original rendering of a single Quantum ESPRESSO 7.5 Gamma-point dielectric tensor and Born-charge diagnostic for COD Silicon.</desc><rect width="960" height="430" fill="#fffdf8"/><text x="48" y="45" font-family="sans-serif" font-size="24" font-weight="700" fill="#172a3a">Silicon Γ-point DFPT response</text><text x="48" y="72" font-family="sans-serif" font-size="14" fill="#52616b">QE 7.5 · epsil=.true. · electronic/ion-clamped dielectric tensor · one fixed setup</text><line x1="82" y1="310" x2="470" y2="310" stroke="#243746"/><line x1="82" y1="95" x2="82" y2="310" stroke="#243746"/><text x="82" y="88" font-family="sans-serif" font-size="13" fill="#52616b">ε∞ (dimensionless)</text>{''.join(bars)}<rect x="505" y="92" width="410" height="170" rx="10" fill="#eef3f8" stroke="#8aa0b2"/><text x="530" y="116" font-family="sans-serif" font-size="16" font-weight="700" fill="#172a3a">Born effective-charge diagnostic</text>{''.join(rows)}<text x="530" y="228" font-family="sans-serif" font-size="13" fill="#52616b">ASR is a reported post-processing convention;</text><text x="530" y="248" font-family="sans-serif" font-size="13" fill="#52616b">no convergence series or static ε₀ claim is shown.</text><text x="82" y="382" font-family="sans-serif" font-size="13" fill="#52616b">Original plot from committed ph.x output; one Γ point, no k/q/cutoff convergence study.</text></svg>''',
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
