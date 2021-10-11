#!/usr/bin/env cat
# ==============================================================================
# Source me in other Bash scripts.
# ==============================================================================

SCRIPTS_DIR=$(dirname $(readlink -f "$0"))

REPO_DIR=$(readlink -f "${SCRIPTS_DIR}/..")

CONFIG_DIR="${REPO_DIR}/config"

CONFIG_DEFAULTS_DIR="${REPO_DIR}/config_defaults"
