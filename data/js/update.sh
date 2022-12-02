#!/usr/bin/env bash

RDIR="$(dirname "$(readlink -f "$0")")"
typeset -r RDIR

CURL=('curl' '-sL')
typeset -r CURL

typeset -A LOCPATH=(
  ['https://unpkg.com/vue@2/dist/vue.js']=\
"${RDIR}/vue2.js"
  ['https://unpkg.com/vue@2/dist/vue.min.js']=\
"${RDIR}/vue2.min.js"
  ['https://unpkg.com/vue@next/dist/vue.global.js']=\
"${RDIR}/vue3.global.js"
  ['https://unpkg.com/vue@next/dist/vue.global.prod.js']=\
"${RDIR}/vue3.global.prod.js"
  ['https://unpkg.com/moment/min/moment.min.js']=\
"${RDIR}/moment.min.js"
  ['https://unpkg.com/moment/min/moment.min.js.map']=\
"${RDIR}/moment.min.js.map"
  ['https://unpkg.com/moment-timezone/builds/moment-timezone-with-data.min.js']=\
"${RDIR}/moment-timezone-with-data.min.js"
  ['https://unpkg.com/lodash@latest/lodash.min.js']=\
"${RDIR}/lodash.min.js"
)

function check()
{
  if ! (type 'curl' >/dev/null 2>&1)
  then
    echo 'No curl command found.' >&2
    return 1
  fi

  return 0
}

# About the second parameter cmd ...
#   1. If it contains the string "{}", then "{}" will be replaced with the file path
#   2. If not, then the file path will be automatically added to the end
function dealFile()
{
  local type="$1" && shift
  local cmd="$1" && shift
  local msg="$1" && shift
  local files=("$@")
  local found=0

  for file in "${files[@]}"
  do
    if [[ -n "$type" ]]
    then
      if [[ "$type" != $(file --mime-type "$file" | \
                            cut -d: -f2 | tr -d '[:space:]') ]]
      then
        continue
      fi
    fi

    found=1

    if [[ -n "$msg" ]]
    then
      echo -e "${msg}\t${file}"
    fi

    if [[ -n "$cmd" ]]
    then
      if ( echo "$cmd" | grep '{}' >/dev/null 2>&1 )
      then
        cmd=${cmd//{}/"$file"}
        env -iS "bash -c '$cmd'"
      else
        env -iS "$cmd" "$file"
      fi
    fi
  done

  # Bash returns an errcode here range 0 to 255,
  # but we treat it as a boolean so it’s enough to use.
  # XXX It is strange to use errcode as a boolean
  return "$found"
}

# MAIN
{
  check || exit 1

  for url in "${!LOCPATH[@]}"
  do
    echo -e "Fetch\t${url}"
    command "${CURL[@]}" "$url" -o "${LOCPATH[${url}]}"

    # If get XML file, try to checkout it
    dealFile \
      'text/html' \
      'git ls-files --error-unmatch {} >/dev/null 2>&1 && git checkout -q {}' \
      'Revert' \
      "${LOCPATH[${url}]}"
  done
}
