#!/usr/bin/env bash
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
