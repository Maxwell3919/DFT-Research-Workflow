from __future__ import annotations

import importlib.util
import json
import os
import sys
from importlib.metadata import version
from pathlib import Path
from types import ModuleType

ROOT = Path(__file__).resolve().parents[2]
EXAMPLE_DIR = Path(__file__).resolve().parent
EXPECTED_VERSIONS = {
    "ase": "3.29.0",
    "pymatgen-core": "2026.7.31",
}
STRUCTURE_SCRIPTS = [
    "ase_repeat_cells.py",
    "ase_surface_vacuum_adsorbates.py",
    "pymatgen_structure_transformations.py",
    "ase_monolayer_model.py",
]
CONVERGENCE_ANALYSIS_SCRIPTS = [
    "convergence_basis_grids.py",
    "convergence_kpoints_smearing.py",
    "convergence_finite_size.py",
    "convergence_response_grids.py",
]
OPTIMIZATION_DIAGNOSTIC_SCRIPTS = [
    "optimization_degrees_constraints.py",
    "optimization_history_diagnostics.py",
    "optimization_restart_verification.py",
    "optimization_multiple_starts.py",
]
REFERENCE_STATE_DIAGNOSTIC_SCRIPTS = [
    "reference_state_protocol_continuity.py",
    "reference_state_fresh_restart.py",
    "reference_state_candidate_comparison.py",
    "reference_state_lineage_manifest.py",
]
ENERGY_LEDGER_SCRIPTS = [
    "formation_energy_ledger.py",
    "formation_energy_reactions.py",
]
EOS_ANALYSIS_SCRIPTS = [
    "eos_sampling_protocol.py",
    "eos_fit_sensitivity.py",
    "eos_phase_enthalpy.py",
]
CONVEX_HULL_ANALYSIS_SCRIPTS = [
    "li_p_convex_hull.py",
]
DEFECT_ANALYSIS_SCRIPTS = [
    "defect_formation_ledger.py",
    "defect_charge_state_envelope.py",
]
SURFACE_ANALYSIS_SCRIPTS = [
    "surface_energy_ledger.py",
    "work_function_potential.py",
    "intermat_si_surfaces.py",
]
ADSORPTION_ANALYSIS_SCRIPTS = [
    "adsorption_energy_ledger.py",
    "adsorption_state_grid.py",
    "cmr_co_adsorption.py",
]
INTERFACE_ANALYSIS_SCRIPTS = [
    "interface_energy_ledger.py",
    "interface_lattice_match.py",
    "al_tin_interface_adhesion.py",
]
BAND_STRUCTURE_ANALYSIS_SCRIPTS = [
    "band_path_ledger.py",
    "band_extrema_fixture.py",
]
DOS_ANALYSIS_SCRIPTS = [
    "dos_projection_closure.py",
]
FERMI_SURFACE_ANALYSIS_SCRIPTS = ["fermi_surface_isovalue_fixture.py"]
CHARGE_DENSITY_ANALYSIS_SCRIPTS = ["charge_difference_closure.py"]
POTENTIAL_ALIGNMENT_ANALYSIS_SCRIPTS = ["potential_lineup_fixture.py"]
CHEMICAL_BONDING_ANALYSIS_SCRIPTS = ["cohp_window_fixture.py"]
MAGNETIC_CONFIGURATION_ANALYSIS_SCRIPTS = ["magnetic_candidate_ledger.py"]
MAGNETIC_ANISOTROPY_EXCHANGE_ANALYSIS_SCRIPTS = ["anisotropy_exchange_ledger.py"]
ELASTIC_RESPONSE_ANALYSIS_SCRIPTS = ["strain_stress_ledger.py"]
DIELECTRIC_RESPONSE_ANALYSIS_SCRIPTS = ["born_charge_dielectric_ledger.py"]
POLARIZATION_ANALYSIS_SCRIPTS = ["polarization_branch_path.py"]
PIEZOELECTRIC_ANALYSIS_SCRIPTS = ["piezoelectric_tensor_ledger.py"]
HARMONIC_PHONON_ANALYSIS_SCRIPTS = ["harmonic_mode_ledger.py"]
ANHARMONIC_PHONON_ANALYSIS_SCRIPTS = ["anharmonic_linewidth_ledger.py"]
LATTICE_THERMAL_TRANSPORT_ANALYSIS_SCRIPTS = ["thermal_transport_tensor_ledger.py"]
EPC_ANALYSIS_SCRIPTS = ["epc_channel_ledger.py"]
SUPERCONDUCTIVITY_ANALYSIS_SCRIPTS = ["superconductivity_moment_ledger.py"]
REACTION_PATH_ANALYSIS_SCRIPTS = ["reaction_path_barrier_ledger.py"]
DIFFUSION_ANALYSIS_SCRIPTS = ["diffusion_network_ledger.py"]
AIMD_ANALYSIS_SCRIPTS = ["aimd_segment_ledger.py"]
STRUCTURAL_SAMPLING_ANALYSIS_SCRIPTS = ["structural_sampling_overlap.py"]
OPTICAL_SPECTRUM_ANALYSIS_SCRIPTS = ["optical_spectrum_comparison_ledger.py"]
TIME_DEPENDENT_RESPONSE_ANALYSIS_SCRIPTS = ["time_dependent_response_ledger.py"]
QUASIPARTICLE_ANALYSIS_SCRIPTS = ["quasiparticle_comparison_ledger.py"]
ELECTRONIC_TRANSPORT_ANALYSIS_SCRIPTS = ["boltztrap_cosb3_transport.py"]
SCRIPTS = [
    *STRUCTURE_SCRIPTS,
    *CONVERGENCE_ANALYSIS_SCRIPTS,
    *OPTIMIZATION_DIAGNOSTIC_SCRIPTS,
    *REFERENCE_STATE_DIAGNOSTIC_SCRIPTS,
    *ENERGY_LEDGER_SCRIPTS,
    *EOS_ANALYSIS_SCRIPTS,
    *CONVEX_HULL_ANALYSIS_SCRIPTS,
    *DEFECT_ANALYSIS_SCRIPTS,
    *SURFACE_ANALYSIS_SCRIPTS,
    *ADSORPTION_ANALYSIS_SCRIPTS,
    *INTERFACE_ANALYSIS_SCRIPTS,
    *BAND_STRUCTURE_ANALYSIS_SCRIPTS,
    *DOS_ANALYSIS_SCRIPTS,
    *FERMI_SURFACE_ANALYSIS_SCRIPTS,
    *CHARGE_DENSITY_ANALYSIS_SCRIPTS,
    *POTENTIAL_ALIGNMENT_ANALYSIS_SCRIPTS,
    *CHEMICAL_BONDING_ANALYSIS_SCRIPTS,
    *MAGNETIC_CONFIGURATION_ANALYSIS_SCRIPTS,
    *MAGNETIC_ANISOTROPY_EXCHANGE_ANALYSIS_SCRIPTS,
    *ELASTIC_RESPONSE_ANALYSIS_SCRIPTS,
    *DIELECTRIC_RESPONSE_ANALYSIS_SCRIPTS,
    *POLARIZATION_ANALYSIS_SCRIPTS,
    *PIEZOELECTRIC_ANALYSIS_SCRIPTS,
    *HARMONIC_PHONON_ANALYSIS_SCRIPTS,
    *ANHARMONIC_PHONON_ANALYSIS_SCRIPTS,
    *LATTICE_THERMAL_TRANSPORT_ANALYSIS_SCRIPTS,
    *EPC_ANALYSIS_SCRIPTS,
    *SUPERCONDUCTIVITY_ANALYSIS_SCRIPTS,
    *REACTION_PATH_ANALYSIS_SCRIPTS,
    *DIFFUSION_ANALYSIS_SCRIPTS,
    *AIMD_ANALYSIS_SCRIPTS,
    *STRUCTURAL_SAMPLING_ANALYSIS_SCRIPTS,
    *OPTICAL_SPECTRUM_ANALYSIS_SCRIPTS,
    *TIME_DEPENDENT_RESPONSE_ANALYSIS_SCRIPTS,
    *QUASIPARTICLE_ANALYSIS_SCRIPTS,
    *ELECTRONIC_TRANSPORT_ANALYSIS_SCRIPTS,
]


def load_module(path: Path) -> ModuleType:
    spec = importlib.util.spec_from_file_location(path.stem, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> None:
    assert sys.version_info[:2] == (3, 12), (
        f"Practical-guide Python version changed: {sys.version_info.major}.{sys.version_info.minor}"
    )
    observed_versions = {name: version(name) for name in EXPECTED_VERSIONS}
    assert observed_versions == EXPECTED_VERSIONS, (
        f"Pinned practical-guide versions changed: {observed_versions}"
    )

    results: dict[str, object] = {}
    for script_name in SCRIPTS:
        path = EXAMPLE_DIR / script_name
        module = load_module(path)
        if not hasattr(module, "run"):
            raise RuntimeError(f"{path} does not define run()")
        results[path.stem] = module.run()

    assert len(results) == 59
    report = {
        "schema_version": 11,
        "project_root": str(ROOT),
        "python": f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
        "versions": observed_versions,
        "structure_scripts": STRUCTURE_SCRIPTS,
        "convergence_analysis_scripts": CONVERGENCE_ANALYSIS_SCRIPTS,
        "optimization_diagnostic_scripts": OPTIMIZATION_DIAGNOSTIC_SCRIPTS,
        "reference_state_diagnostic_scripts": REFERENCE_STATE_DIAGNOSTIC_SCRIPTS,
        "energy_ledger_scripts": ENERGY_LEDGER_SCRIPTS,
        "eos_analysis_scripts": EOS_ANALYSIS_SCRIPTS,
        "convex_hull_analysis_scripts": CONVEX_HULL_ANALYSIS_SCRIPTS,
        "defect_analysis_scripts": DEFECT_ANALYSIS_SCRIPTS,
        "surface_analysis_scripts": SURFACE_ANALYSIS_SCRIPTS,
        "adsorption_analysis_scripts": ADSORPTION_ANALYSIS_SCRIPTS,
        "interface_analysis_scripts": INTERFACE_ANALYSIS_SCRIPTS,
        "band_structure_analysis_scripts": BAND_STRUCTURE_ANALYSIS_SCRIPTS,
        "dos_analysis_scripts": DOS_ANALYSIS_SCRIPTS,
        "fermi_surface_analysis_scripts": FERMI_SURFACE_ANALYSIS_SCRIPTS,
        "charge_density_analysis_scripts": CHARGE_DENSITY_ANALYSIS_SCRIPTS,
        "potential_alignment_analysis_scripts": POTENTIAL_ALIGNMENT_ANALYSIS_SCRIPTS,
        "chemical_bonding_analysis_scripts": CHEMICAL_BONDING_ANALYSIS_SCRIPTS,
        "magnetic_configuration_analysis_scripts": MAGNETIC_CONFIGURATION_ANALYSIS_SCRIPTS,
        "magnetic_anisotropy_exchange_analysis_scripts": MAGNETIC_ANISOTROPY_EXCHANGE_ANALYSIS_SCRIPTS,
        "elastic_response_analysis_scripts": ELASTIC_RESPONSE_ANALYSIS_SCRIPTS,
        "dielectric_response_analysis_scripts": DIELECTRIC_RESPONSE_ANALYSIS_SCRIPTS,
        "polarization_analysis_scripts": POLARIZATION_ANALYSIS_SCRIPTS,
        "piezoelectric_analysis_scripts": PIEZOELECTRIC_ANALYSIS_SCRIPTS,
        "harmonic_phonon_analysis_scripts": HARMONIC_PHONON_ANALYSIS_SCRIPTS,
        "anharmonic_phonon_analysis_scripts": ANHARMONIC_PHONON_ANALYSIS_SCRIPTS,
        "lattice_thermal_transport_analysis_scripts": LATTICE_THERMAL_TRANSPORT_ANALYSIS_SCRIPTS,
        "epc_analysis_scripts": EPC_ANALYSIS_SCRIPTS,
        "superconductivity_analysis_scripts": SUPERCONDUCTIVITY_ANALYSIS_SCRIPTS,
        "reaction_path_analysis_scripts": REACTION_PATH_ANALYSIS_SCRIPTS,
        "diffusion_analysis_scripts": DIFFUSION_ANALYSIS_SCRIPTS,
        "aimd_analysis_scripts": AIMD_ANALYSIS_SCRIPTS,
        "structural_sampling_analysis_scripts": STRUCTURAL_SAMPLING_ANALYSIS_SCRIPTS,
        "optical_spectrum_analysis_scripts": OPTICAL_SPECTRUM_ANALYSIS_SCRIPTS,
        "time_dependent_response_analysis_scripts": TIME_DEPENDENT_RESPONSE_ANALYSIS_SCRIPTS,
        "quasiparticle_analysis_scripts": QUASIPARTICLE_ANALYSIS_SCRIPTS,
        "electronic_transport_analysis_scripts": ELECTRONIC_TRANSPORT_ANALYSIS_SCRIPTS,
        "executed_scripts": SCRIPTS,
        "results": results,
        "evidence_boundary": (
            "Execution establishes declared structural transformations, synthetic convergence-table "
            "analysis, bounded ASE/EMT or synthetic optimization diagnostics, and deterministic "
            "reference-state metadata, energy-ledger arithmetic, synthetic EOS, defect, surface, adsorption, Fermi-isovalue, charge-difference closure, potential-lineup, COHP-window, magnetic-candidate, magnetic-anisotropy/exchange-ledger, elastic strain--stress-ledger, Born-charge/dielectric-ledger, polarization-branch, piezoelectric-ledger, harmonic-mode-ledger, anharmonic-linewidth-ledger, lattice-transport-tensor-ledger, EPC-channel-ledger, superconductivity-spectral-moment-ledger, reaction-path-barrier-ledger, diffusion-network-ledger, AIMD-segment-ledger, structural-sampling-overlap, optical-spectrum-comparison, time-dependent-response, and quasiparticle-comparison metadata analysis, and frozen public-data convex-hull, Si-surface, CMR adsorption, and CoSb3 transport redraws only; "
            "it does not establish DFT convergence, a physical minimum, a real reference ground state, "
            "a material formation, surface or adsorption energy, real work function, defect charge state or concentration, physical EOS or phase transition, independent database validation, "
            "candidate completeness, stability, transferability, a dielectric response, GW result, or a scientific conclusion."
        ),
    }

    artifact_dir = os.environ.get("PRACTICAL_EXECUTION_ARTIFACT_DIR")
    if artifact_dir:
        output_dir = Path(artifact_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        (output_dir / "practical-guide-execution.json").write_text(
            json.dumps(report, indent=2) + "\n", encoding="utf-8"
        )

    print(json.dumps(report, indent=2))
    print(
        "Practical guide execution passed: 59/59 examples; four structural transformations, "
        "four synthetic convergence analyses, four bounded optimization diagnostics, and "
        "four deterministic reference-state diagnostics, two energy-ledger fixtures, three synthetic EOS analyses, "
        "one frozen public-data convex-hull reconstruction, two synthetic defect analyses, two synthetic surface analyses, "
            "one frozen public-data Si-surface redraw, two synthetic adsorption analyses, one frozen public-data CMR adsorption redraw, one frozen public-output CoSb3 transport redraw, one invented Fermi-isovalue fixture, one invented charge-difference closure fixture, one invented potential-lineup fixture, one invented COHP-window fixture, one invented magnetic-candidate fixture, one invented magnetic-anisotropy/exchange-ledger fixture, one invented elastic strain--stress ledger fixture, one invented Born-charge/dielectric ledger fixture, one invented polarization-branch fixture, one invented piezoelectric ledger fixture, one invented harmonic-mode ledger fixture, one invented anharmonic-linewidth ledger fixture, one invented lattice-transport tensor ledger fixture, one invented EPC channel ledger fixture, one invented superconductivity spectral-moment ledger fixture, one invented reaction-path barrier ledger fixture, one invented diffusion-network ledger fixture, one invented AIMD segment ledger fixture, one invented structural-sampling overlap ledger fixture, one invented optical-spectrum comparison ledger fixture, one invented time-dependent-response ledger fixture, and one invented quasiparticle-comparison ledger fixture under pinned versions; none performs a DFT, dielectric-response, GW, transport rerun, or material-property calculation."
    )


if __name__ == "__main__":
    main()
