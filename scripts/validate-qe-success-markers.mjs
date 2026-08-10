import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';

const root = resolve(process.cwd());
const positive = '     convergence has been achieved in  10 iterations\n';
const negative = '     No convergence has been achieved after 100 iterations: stopping\n';
const scfSuccess = /^\s+convergence has been achieved in\s+\d+\s+iterations\s*$/im;

if (!scfSuccess.test(positive) || scfSuccess.test(negative)) {
  throw new Error('anchored QE SCF success-marker regression fixture failed');
}

const readerFiles = [
  'src/content/topics/band-structure.md',
  'src/content/topics/choose-dft-method-and-computational-setup.md',
  'src/content/topics/density-of-states-and-projected-density-of-states.md',
  'src/content/topics/fermi-surface-and-full-brillouin-zone-analysis.md',
  'src/content/practical-guides/audit-a-qe-calculation.md',
  'src/content/practical-guides/build-reciprocal-path-ledger.md',
  'src/content/practical-guides/check-born-charge-and-dielectric-ledger.md',
  'src/content/practical-guides/check-dos-normalization-and-projection-closure.md',
  'src/content/practical-guides/check-harmonic-mode-ledger.md',
  'src/content/practical-guides/choose-relaxed-degrees-and-constraints.md',
  'src/content/practical-guides/compare-band-path-and-full-zone-extrema.md',
  'src/content/practical-guides/compare-fresh-and-restarted-electronic-states.md',
  'src/content/practical-guides/compare-full-zone-isovalue-and-band-path.md',
  'src/content/practical-guides/converge-basis-cutoffs-and-grids.md',
  'src/content/practical-guides/converge-finite-size-vacuum-and-images.md',
  'src/content/practical-guides/converge-k-points-and-smearing.md',
  'src/content/practical-guides/diagnose-forces-stress-and-state.md',
  'src/content/practical-guides/prepare-fixed-geometry-reference-calculation.md',
];

const unsafeFixedSubstring = /grep\s+[^\n]*-[A-Za-z]*[FH][A-Za-z]*[^\n]*["']convergence has been achieved["']/i;
const failures = [];
for (const file of readerFiles) {
  const text = await readFile(resolve(root, file), 'utf8');
  text.split('\n').forEach((line, index) => {
    if (unsafeFixedSubstring.test(line)) {
      failures.push(`${file}:${index + 1}: unanchored fixed-string SCF success check`);
    }
  });
}

const pythonFiles = [
  'examples/practical-guides/qe_calculation_audit.py',
  'examples/practical-guides/qe_hpc_terminal_inspection.py',
  'examples/practical-guides/qe_manual_handoff.py',
  'examples/practical-guides/silicon_gamma_phonon.py',
  'examples/practical-guides/silicon_qe_convergence.py',
  'examples/practical-guides/silicon_qe_dielectric.py',
  'examples/practical-guides/silicon_qe_relax.py',
  'examples/practical-guides/silicon_qe_restarts.py',
];
const unsafePythonSubstring = /["']convergence has been achieved["']\s+(?:not\s+)?in\s+/i;
for (const file of pythonFiles) {
  const text = await readFile(resolve(root, file), 'utf8');
  text.split('\n').forEach((line, index) => {
    if (unsafePythonSubstring.test(line)) {
      failures.push(`${file}:${index + 1}: bare Python substring SCF success check`);
    }
  });
}

if (failures.length > 0) {
  throw new Error(`Unsafe QE success-marker checks:\n${failures.join('\n')}`);
}

console.log('QE success-marker validation passed: anchored positive fixture accepted, negative fixture rejected, and reader/helper substring checks absent.');
