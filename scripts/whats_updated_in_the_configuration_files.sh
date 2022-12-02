#!/usr/bin/env bash

RDIR="$(dirname "$(readlink -f "$0")")"
typeset -r RDIR

SKIPLIST=(
  'authority.yml'
  'cookies.yml'
  'greeting.yml'
  'menu.yml'
  'names.yml'
  'pool_eggs.yml'
  'prophecy.yml'
  'qa.yml'
)
typeset -ar SKIPLIST

# shellcheck source=/dev/null
source "${RDIR}/config.sh"

{
  mapfile -t configs < <(find "$CONFIG_DIR" -type f -name '*.yml' -exec basename {} \;)

  for config in "${configs[@]}"
  do
    skip=0

    for file in "${SKIPLIST[@]}"
    do
      if [[ "$file" == "$config" ]]
      then
        skip=1
        break
      fi
    done

    if [[ 0 -eq "$skip" ]] && [[ -r "${CONFIG_DEFAULTS_DIR}/${config}" ]]
    then
      echo "# ============================== #"
      echo "# ！文件 ${config} 有以下更新！#"
      echo "# ============================== #"

      diff -u --color \
        "${CONFIG_DIR}/${config}" "${CONFIG_DEFAULTS_DIR}/${config}"
    fi
  done
}
