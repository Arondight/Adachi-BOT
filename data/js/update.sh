#!/usr/bin/env bash

RDIR=$(dirname $(readlink -f "$0"))
CURL=('curl' '-sL')

typeset -A LOCPATH=(
  ['https://cn.vuejs.org/js/vue.js']="${RDIR}/vue2.js"
  ['https://cn.vuejs.org/js/vue.min.js']="${RDIR}/vue2.min.js"
  ['https://unpkg.com/vue@next/dist/vue.global.js']="${RDIR}/vue3.global.js"
  ['https://unpkg.com/vue@next/dist/vue.global.prod.js']="${RDIR}/vue3.global.prod.js"
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

# MAIN
{
  check || exit 1

  for url in "${!LOCPATH[@]}"
  do
    echo -e "Fetch\t${url}"
    command "${CURL[@]}" "$url" -o "${LOCPATH[${url}]}"
  done
}
