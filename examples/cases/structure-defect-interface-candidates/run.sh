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
set -euo pipefail
root="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)"
mkdir -p "$root/source" "$root/input" "$root/output" "$root/derived" "$root/figures"
"${PYTHON:-python3}" "$root/parse.py" | tee "$root/output/run.stdout"
