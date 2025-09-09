#!/usr/bin/env bash
set -euo pipefail

DOMAIN="vatevo.com"
RESOLVERS=("1.1.1.1" "8.8.8.8")
rows=(
  "A @"
  "CNAME www"
  "CNAME dashboard"
  "CNAME docs"
  "CNAME api"
)

echo "== DNS VERIFY: ${DOMAIN} =="
for r in "${RESOLVERS[@]}"; do
  echo "-- resolver ${r} --"
  for row in "${rows[@]}"; do
    t=${row%% *}; h=${row##* }
    fqdn=$([ "$h" = "@" ] && echo "$DOMAIN" || echo "$h.$DOMAIN")
    if [ "$t" = "A" ]; then
      dig @"$r" +short A "$fqdn"
    else
      dig @"$r" +short CNAME "$fqdn"
    fi
  done
  echo
done
