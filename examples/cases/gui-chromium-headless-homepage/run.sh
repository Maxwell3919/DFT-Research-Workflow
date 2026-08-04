#!/usr/bin/env bash
if [[ "${CASE_RUN_ROOT_ACTIVE:-}" == "1" ]]; then
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  active_root=$(CDPATH= cd -- "${CASE_RUN_ROOT:?FAIL internal run root is missing.}" && pwd -P) || exit 2
  [[ "$case_dir" == "$active_root" && -f "$active_root/.case-run-root" ]] || { printf 'FAIL internal run root marker is invalid.\n' >&2; exit 2; }
else
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  : "${CASE_RUN_ROOT:?FAIL set CASE_RUN_ROOT to an existing empty external directory; committed case artifacts are never rerun in place.}"
  run_root=$(CDPATH= cd -- "$CASE_RUN_ROOT" && pwd -P) || { printf 'FAIL CASE_RUN_ROOT must be an existing directory.\n' >&2; exit 2; }
  if [[ "$run_root" == "$case_dir" || "$run_root" == "$case_dir/"* ]] || [[ -n "$(find "$run_root" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    printf 'FAIL CASE_RUN_ROOT must be an empty external directory, not this case or its child.\n' >&2; exit 2
  fi
  cp -a "$case_dir/." "$run_root/"
  : > "$run_root/.case-run-root"
  exec env CASE_RUN_ROOT_ACTIVE=1 CASE_RUN_ROOT="$run_root" bash "$run_root/run.sh" "$@"
fi
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$case_dir"
mkdir -p "$case_dir/output" "$case_dir/derived" "$case_dir/figures"

{
  printf 'case=gui-chromium-headless-homepage\n'
  printf 'display=%s\n' "${DISPLAY:-<unset>}"
  printf 'observed_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  for command_name in Xvfb xvfb-run xdpyinfo glxinfo openbox xdotool scrot import vesta google-chrome xauth; do
    if command -v "$command_name" >/dev/null 2>&1; then
      printf 'command.%s=%s\n' "$command_name" "$(command -v "$command_name")"
    else
      printf 'command.%s=<unavailable>\n' "$command_name"
    fi
  done
  if xdpyinfo >/dev/null 2>&1; then
    printf 'xdpyinfo=PASS\n'
  else
    printf 'xdpyinfo=FAIL (no usable DISPLAY)\n'
  fi
  if command -v glxinfo >/dev/null 2>&1 && glxinfo -B >/dev/null 2>&1; then
    printf 'glxinfo=PASS\n'
  else
    printf 'glxinfo=UNAVAILABLE\n'
  fi
  if command -v Xvfb >/dev/null 2>&1; then
    printf 'xvfb=AVAILABLE (not started by this browser-headless case)\n'
  else
    printf 'xvfb=UNAVAILABLE; X11 launch and window detection are blocked\n'
  fi
  if command -v xdotool >/dev/null 2>&1; then
    printf 'window_detection=AVAILABLE (not used without X11 display)\n'
  else
    printf 'window_detection=UNAVAILABLE (xdotool absent)\n'
  fi
  printf 'chrome_version=%s\n' "$(google-chrome --product-version)"
} > "$case_dir/environment.txt"

google-chrome --headless=new --disable-gpu --hide-scrollbars --window-size=1280,720 \
  --screenshot="$case_dir/figures/chromium-headless-walkthrough.png" \
  "file://$case_dir/source/walkthrough.html" > "$case_dir/output/chromium.stdout" 2> "$case_dir/output/chromium.stderr.raw"
printf 'exit=0\n' >> "$case_dir/output/chromium.stdout"
raw_stderr_sha256=$(sha256sum "$case_dir/output/chromium.stderr.raw" | awk '{print $1}')
sed "s|$case_dir|.|g" "$case_dir/output/chromium.stderr.raw" > "$case_dir/output/chromium.stderr"
public_stderr_sha256=$(sha256sum "$case_dir/output/chromium.stderr" | awk '{print $1}')
{
  printf 'rule=replace the exact case directory prefix with a dot\n'
  printf 'raw_stderr_sha256=%s\n' "$raw_stderr_sha256"
  printf 'public_stderr_sha256=%s\n' "$public_stderr_sha256"
} > "$case_dir/output/sanitization.txt"
bash "$case_dir/extract.sh"
sha256sum source/walkthrough.html environment.txt figures/chromium-headless-walkthrough.png output/chromium.stdout output/chromium.stderr output/environment-excerpt.txt output/sanitization.txt > "$case_dir/output/SHA256SUMS"
python3 "$case_dir/parse.py" --write-derived
