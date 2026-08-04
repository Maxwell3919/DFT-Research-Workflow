#!/usr/bin/env bash
if [[ "${CASE_RUN_ROOT_ACTIVE:-}" == "1" ]]; then
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  active_root=$(CDPATH= cd -- "${CASE_RUN_ROOT:?FAIL internal run root is missing.}" && pwd -P) || exit 2
  [[ "$case_dir" == "$active_root" && -f "$active_root/.case-run-root" ]] || { printf 'FAIL internal run root marker is invalid.\n' >&2; exit 2; }
else
  case_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
  repo_root=$(CDPATH= cd -- "$case_dir/../../.." && pwd -P)
  : "${CASE_RUN_ROOT:?FAIL set CASE_RUN_ROOT to an existing empty external directory; committed case artifacts are never rerun in place.}"
  run_root=$(CDPATH= cd -- "$CASE_RUN_ROOT" && pwd -P) || { printf 'FAIL CASE_RUN_ROOT must be an existing directory.\n' >&2; exit 2; }
  if [[ "$run_root" == "$repo_root" || "$run_root" == "$repo_root/"* ]] || [[ -n "$(find "$run_root" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
    printf 'FAIL CASE_RUN_ROOT must be an empty directory outside the repository.\n' >&2; exit 2
  fi
  cp -a "$case_dir/." "$run_root/"
  : > "$run_root/.case-run-root"
  exec env CASE_RUN_ROOT_ACTIVE=1 CASE_RUN_ROOT="$run_root" bash "$run_root/run.sh" "$@"
fi
# Download and inspect the specific COD record captured by this case.
set -euo pipefail
cd "$(dirname "$0")"

# COD completed direct TLS on Talos after the configured local proxy terminated
# the server handshake.  Keep this narrow transport workaround visible and do
# not generalize it to other database services.
env -u https_proxy -u http_proxy -u all_proxy -u HTTPS_PROXY -u HTTP_PROXY -u ALL_PROXY \
curl --fail --location --silent --show-error \
  --dump-header output/cod-response.headers \
  --output source/9013102.cif \
  https://www.crystallography.net/cod/9013102.cif
printf 'downloaded_at_utc=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > output/downloaded-at.txt
printf 'http_status=%s\nbytes=%s\n' \
  "$(awk 'toupper($1) ~ /^HTTP/ {code=$2} END {print code}' output/cod-response.headers)" \
  "$(wc -c < source/9013102.cif)" > output/run.txt
python3 analyze_structure.py
python3 parse.py
