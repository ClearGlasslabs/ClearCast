#!/usr/bin/env bash
# Self-hosted GitHub Actions runner setup for ClearGlassInc
# Usage: REPO_URL=https://github.com/org/repo TOKEN=<reg-token> ./setup-runner.sh
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration – override via environment variables or edit below
# ---------------------------------------------------------------------------
REPO_URL="${REPO_URL:-https://github.com/openwindow369/clearglassinc-11}"
TOKEN="${TOKEN:-}"               # GitHub registration token (required)
RUNNER_NAME="${RUNNER_NAME:-clearglass-runner-1}"
RUNNER_USER="${RUNNER_USER:-gh-runner}"
RUNNER_DIR="${RUNNER_DIR:-/opt/actions-runner}"
RUNNER_VERSION="2.316.1"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,linux,x64,clearglass}"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
info()  { echo "[INFO]  $*"; }
error() { echo "[ERROR] $*" >&2; exit 1; }

require_root() { [ "$(id -u)" -eq 0 ] || error "Run this script as root (sudo)."; }

# ---------------------------------------------------------------------------
# Validate inputs
# ---------------------------------------------------------------------------
require_root
[ -n "$TOKEN" ] || error "TOKEN is required. Get it from: Settings > Actions > Runners > New self-hosted runner."

# ---------------------------------------------------------------------------
# Install system dependencies
# ---------------------------------------------------------------------------
info "Updating package list and installing dependencies..."
apt-get update -y
apt-get install -y \
  curl wget git jq rsync \
  python3 python3-pip python3-venv \
  nodejs npm \
  build-essential g++ cmake \
  docker.io

# Add runner user to docker group so workflows can use Docker
usermod -aG docker "${RUNNER_USER}" 2>/dev/null || true

# ---------------------------------------------------------------------------
# Create dedicated non-root runner user
# ---------------------------------------------------------------------------
if ! id "${RUNNER_USER}" &>/dev/null; then
  info "Creating unprivileged user '${RUNNER_USER}'..."
  useradd --system --create-home --shell /bin/bash "${RUNNER_USER}"
fi

# ---------------------------------------------------------------------------
# Download and extract the runner
# ---------------------------------------------------------------------------
ARCHIVE="actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz"
DOWNLOAD_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${ARCHIVE}"

info "Creating runner directory at ${RUNNER_DIR}..."
mkdir -p "${RUNNER_DIR}"
chown "${RUNNER_USER}:${RUNNER_USER}" "${RUNNER_DIR}"

if [ ! -f "${RUNNER_DIR}/config.sh" ]; then
  info "Downloading GitHub Actions runner v${RUNNER_VERSION}..."
  curl -fsSL -o "/tmp/${ARCHIVE}" "${DOWNLOAD_URL}"
  tar -xzf "/tmp/${ARCHIVE}" -C "${RUNNER_DIR}"
  rm -f "/tmp/${ARCHIVE}"
  chown -R "${RUNNER_USER}:${RUNNER_USER}" "${RUNNER_DIR}"
fi

# ---------------------------------------------------------------------------
# Configure the runner (runs as the runner user)
# ---------------------------------------------------------------------------
info "Configuring runner '${RUNNER_NAME}'..."
sudo -u "${RUNNER_USER}" "${RUNNER_DIR}/config.sh" \
  --url        "${REPO_URL}" \
  --token      "${TOKEN}" \
  --name       "${RUNNER_NAME}" \
  --labels     "${RUNNER_LABELS}" \
  --work       "_work" \
  --unattended \
  --replace

# ---------------------------------------------------------------------------
# Install systemd service
# ---------------------------------------------------------------------------
SERVICE_FILE="/etc/systemd/system/github-actions-runner.service"
info "Installing systemd service..."

cat > "${SERVICE_FILE}" <<EOF
[Unit]
Description=GitHub Actions Self-Hosted Runner (ClearGlassInc)
After=network.target docker.service
Wants=docker.service

[Service]
Type=simple
User=${RUNNER_USER}
WorkingDirectory=${RUNNER_DIR}
ExecStart=${RUNNER_DIR}/run.sh
Restart=always
RestartSec=10
KillMode=process
KillSignal=SIGTERM
TimeoutStopSec=5min
# Least-privilege environment
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable github-actions-runner
systemctl start  github-actions-runner

info "Runner service status:"
systemctl status github-actions-runner --no-pager

info ""
info "✅  Setup complete!"
info "    Runner : ${RUNNER_NAME}"
info "    Repo   : ${REPO_URL}"
info "    Service: github-actions-runner (enabled on boot)"
info ""
info "To view live logs: journalctl -u github-actions-runner -f"
info "To remove:         systemctl stop github-actions-runner && ${RUNNER_DIR}/config.sh remove --token <token>"
