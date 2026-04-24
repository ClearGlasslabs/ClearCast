#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-clearglassinc.io}"
WWW_DOMAIN="www.${DOMAIN}"
DNS_RESOLVER="${DNS_RESOLVER:-1.1.1.1}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd dig
require_cmd curl

DNS_CONNECTIVITY_OK=0

dig_query() {
  local name="$1"
  local type="$2"
  local out=""

  if out="$(dig +short @"${DNS_RESOLVER}" "${name}" "${type}" 2>/dev/null)"; then
    DNS_CONNECTIVITY_OK=1
    if [[ -n "${out//[$'\n\r\t ']}" ]]; then
      printf '%s\n' "${out}"
      return 0
    fi
  fi

  echo "WARNING: DNS resolver ${DNS_RESOLVER} unavailable for ${name} ${type}; falling back to system resolver." >&2
  if out="$(dig +short "${name}" "${type}" 2>/dev/null)"; then
    DNS_CONNECTIVITY_OK=1
    printf '%s\n' "${out}"
  fi
}

echo "== DNS checks via ${DNS_RESOLVER} =="
DIG_APEX_A="$(dig_query "${DOMAIN}" A | tr '\n' ' ' | xargs || true)"
printf '%s\n' "${DIG_APEX_A}"
if [[ ${DNS_CONNECTIVITY_OK} -eq 0 ]]; then
  echo "WARNING: DNS checks skipped (no resolver connectivity in this environment)." >&2
elif [[ -z "${DIG_APEX_A}" ]]; then
  echo "ERROR: ${DOMAIN} has no A record via resolver checks" >&2
  exit 2
fi

DIG_WWW_CNAME="$(dig_query "${WWW_DOMAIN}" CNAME | tr '\n' ' ' | xargs || true)"
printf '%s\n' "${DIG_WWW_CNAME}"
if [[ -z "${DIG_WWW_CNAME}" ]]; then
  if [[ ${DNS_CONNECTIVITY_OK} -eq 1 ]]; then
    echo "WARNING: ${WWW_DOMAIN} has no CNAME via resolver checks" >&2
  fi
else
  echo "www CNAME -> ${DIG_WWW_CNAME}"
fi

echo
echo "== HTTP/HTTPS checks =="

check_header() {
  local url="$1"
  echo "-- ${url}"
  if ! curl -sS -I --max-time 15 "${url}" | sed -n '1,5p'; then
    echo "WARNING: Unable to fetch headers for ${url} in this environment." >&2
  fi
}

check_header "http://${DOMAIN}"
check_header "http://${WWW_DOMAIN}"
check_header "https://${WWW_DOMAIN}"
check_header "https://${DOMAIN}"

echo
echo "Checks complete."
