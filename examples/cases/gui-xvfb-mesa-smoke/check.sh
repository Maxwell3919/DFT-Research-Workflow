#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
failed=0
pass() { printf 'PASS  %s\n' "$1"; }
warn() { printf 'WARN  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; failed=1; }

for file in Dockerfile source/x11-smoke.sh output/docker-build.stdout output/docker-build.stderr output/run-metadata.txt derived/capture.json output/SHA256SUMS; do
  if [ -s "$case_dir/$file" ]; then pass "G0 non-empty $file"; else fail "G0 missing or empty $file"; fi
done
if (cd "$case_dir" && sha256sum -c output/SHA256SUMS >/dev/null); then pass 'G0 SHA-256 records match'; else fail 'G0 SHA-256 mismatch'; fi
if rg -q '^run_status=BLOCKED docker build failed' "$case_dir/output/run-metadata.txt"; then
  warn 'G1 BLOCKED: Docker Hub image metadata request failed; no container was run.'
  python3 "$case_dir/parse.py" >/dev/null && pass 'G0 parser accepted the hash-bound build blocker' || fail 'G0 parser rejected the build blocker'
  warn 'G3 NOT TESTED: no Xvfb display, llvmpipe renderer, window detection, or screenshot exists after the failed image pull.'
elif rg -q '^exit=0$' "$case_dir/output/docker-build.stdout" && rg -q '^exit=0$' "$case_dir/output/docker-run.stdout"; then
  pass 'G1 Docker build and X11 command exited successfully'
  if rg -q '^xdpyinfo=PASS$' "$case_dir/output/x11-smoke.txt" && rg -q '^software_renderer=PASS llvmpipe$' "$case_dir/output/x11-smoke.txt"; then pass 'G1 Xvfb display and Mesa llvmpipe passed'; else fail 'G1 Xvfb or llvmpipe marker missing'; fi
  if rg -q '^window_detection=PASS id=[0-9]+$' "$case_dir/output/x11-smoke.txt"; then pass 'G3 xdotool found the real xmessage window'; else fail 'G3 xdotool window detection marker missing'; fi
  if file "$case_dir/figures/xvfb-mesa-window.png" | rg -q 'PNG image data, 1280 x 720'; then pass 'G3 1280 x 720 screenshot exists'; else fail 'G3 screenshot type or dimensions differ'; fi
  python3 "$case_dir/parse.py" >/dev/null && pass 'G3 strict parser accepted X11 artifacts' || fail 'G3 strict parser rejected artifacts'
else
  fail 'G1 Docker build/run did not reach either the recorded success or blocked state'
fi
warn 'G2 NOT CLAIMED: this is environment qualification, not a scientific solver or optimizer.'
warn 'G4 NOT TESTED: this case has no numerical observable.'
warn 'G5 NOT CLAIMED: GUI visibility does not establish structure or DFT scientific validity.'
exit "$failed"
