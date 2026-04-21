#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-clearglassinc.io}"
WWW_DOMAIN="www.${DOMAIN}"
DNS_RESOLVER="1.1.1.1"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd dig
require_cmd curl

echo "== DNS checks via ${DNS_RESOLVER} =="
dig +short @"${DNS_RESOLVER}" "${DOMAIN}" A
DIG_APEX_A="$(dig +short @"${DNS_RESOLVER}" "${DOMAIN}" A | tr '\n' ' ' | xargs || true)"
if [[ -z "${DIG_APEX_A}" ]]; then
  echo "ERROR: ${DOMAIN} has no A record via ${DNS_RESOLVER}" >&2
  exit 2
fi

dig +short @"${DNS_RESOLVER}" "${WWW_DOMAIN}" CNAME
DIG_WWW_CNAME="$(dig +short @"${DNS_RESOLVER}" "${WWW_DOMAIN}" CNAME | tr '\n' ' ' | xargs || true)"
if [[ -z "${DIG_WWW_CNAME}" ]]; then
  echo "WARNING: ${WWW_DOMAIN} has no CNAME via ${DNS_RESOLVER}" >&2
else
  echo "www CNAME -> ${DIG_WWW_CNAME}"
fi

echo
echo "== HTTP/HTTPS checks =="

check_header() {
  local url="$1"
  echo "-- ${url}"
  curl -sS -I --max-time 15 "${url}" | sed -n '1,5p'
}

check_header "http://${DOMAIN}"
check_header "http://${WWW_DOMAIN}"
check_header "https://${WWW_DOMAIN}"
check_header "https://${DOMAIN}"

echo
echo "Checks complete."
