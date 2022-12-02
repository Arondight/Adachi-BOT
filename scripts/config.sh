#!/usr/bin/env bash
# ==============================================================================
# Source me in other Bash scripts.
# ==============================================================================

SCRIPTS_DIR="$(dirname "$(readlink -f "$0")")"
export SCRIPTS_DIR

REPO_DIR="$(readlink -f "${SCRIPTS_DIR}/..")"
export REPO_DIR

CONFIG_DIR="${REPO_DIR}/config"
export CONFIG_DIR

CONFIG_DEFAULTS_DIR="${REPO_DIR}/config_defaults"
export CONFIG_DEFAULTS_DIR
