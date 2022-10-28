RDIR=$(dirname $(readlink -f "$0"))
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

source "${RDIR}/config.sh"

{
  configs=($(find "$CONFIG_DIR" -type f -name '*.yml' \
    | xargs -I {} basename {}))

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
