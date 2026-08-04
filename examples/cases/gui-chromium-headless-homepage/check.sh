#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
failed=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failed=1; }

for file in source/walkthrough.html input/README.md environment.txt figures/chromium-headless-walkthrough.png output/chromium.stdout output/chromium.stderr output/environment-excerpt.txt output/sanitization.txt output/SHA256SUMS derived/capture.json; do
  if [ -s "$case_dir/$file" ]; then pass "G0 non-empty $file"; else fail "G0 missing or empty $file"; fi
done
if (cd "$case_dir" && sha256sum -c output/SHA256SUMS >/dev/null); then pass 'G0 SHA-256 records match generated artifacts'; else fail 'G0 SHA-256 mismatch'; fi
if grep -q '^exit=0$' "$case_dir/output/chromium.stdout"; then pass 'G1 Chromium headless command exited successfully'; else fail 'G1 missing successful Chromium exit marker'; fi
if file "$case_dir/figures/chromium-headless-walkthrough.png" | grep -q 'PNG image data, 1280 x 720'; then pass 'G3 expected 1280 x 720 PNG artifact exists'; else fail 'G3 PNG dimensions or type differ'; fi
if ! grep -Fq "$case_dir" "$case_dir/output/chromium.stderr"; then pass 'G0 public stderr contains no runtime case path'; else fail 'G0 public stderr contains a runtime case path'; fi
python3 "$case_dir/parse.py" >/dev/null && pass 'G3 strict PNG/output parser accepted the artifacts' || fail 'G3 strict parser rejected the artifacts'
warn 'X11 GUI launch, OpenGL renderer, and window detection were not tested because Xvfb/glxinfo/xdotool are unavailable on Talos.'
warn 'G4 NOT TESTED: this is a browser-rendering case, not a numerical-observable convergence study.'
warn 'G5 NOT CLAIMED: screenshot evidence cannot establish structure or DFT scientific validity.'
exit "$failed"
