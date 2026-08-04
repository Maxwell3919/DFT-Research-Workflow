#!/usr/bin/env bash
set -euo pipefail

case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_root=$(CDPATH= cd -- "$case_dir/../../.." && pwd)
media_dir="$repo_root/public/media/gui/chromium-headless-homepage"
cd "$case_dir"
mkdir -p "$case_dir/output" "$case_dir/derived" "$case_dir/figures" "$media_dir"

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
rm -f "$case_dir/output/chromium.stderr.raw"
cp "$case_dir/figures/chromium-headless-walkthrough.png" "$media_dir/chromium-headless-walkthrough.png"
bash "$case_dir/extract.sh"
sha256sum source/walkthrough.html environment.txt figures/chromium-headless-walkthrough.png output/chromium.stdout output/chromium.stderr output/environment-excerpt.txt output/sanitization.txt > "$case_dir/output/SHA256SUMS"
python3 "$case_dir/parse.py" --write-derived
