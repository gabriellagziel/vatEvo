#!/usr/bin/env bash
set -euo pipefail

BASES=(
  "https://vatevo.com"
  "https://dashboard.vatevo.com"
  "https://docs.vatevo.com"
  "https://api.vatevo.com/status"
)

fail=0
for url in "${BASES[@]}"; do
  echo "==> $url"
  code=$(curl -ks -o /dev/null -w "%{http_code}" "$url")
  echo "HTTP $code"
  if [[ "$url" == *"/status" ]]; then
    body=$(curl -ks "$url")
    echo "BODY: $body"
    echo "$body" | jq -e '.status=="ok"' >/dev/null 2>&1 || { echo "status!=ok"; fail=1; }
  fi
  [[ "$code" =~ ^2..$ ]] || fail=1
  echo
done

if [[ $fail -ne 0 ]]; then
  echo "SMOKE FAILED"; exit 1
else
  echo "SMOKE PASSED"
fi