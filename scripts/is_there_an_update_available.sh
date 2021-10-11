#!/usr/bin/env bash

{
  remoteUrl='https://github.com/Arondight/Adachi-BOT.git'
  remoteBranch='master'

  remoteID=$(git ls-remote -qh "$remoteUrl" "$remoteBranch" 2>/dev/null \
    | awk '{print $1}')
  localID=$(git show-ref origin/master | awk '{print $1}')
  currentID=$(git rev-list --max-parents=0 HEAD)

  if [[ -z "$remoteID" ]]
  then
    echo "哎呀，网络不好，出错了……"
    exit 1
  fi

  word=$([[ "$remoteID" == "$localID" ]] && echo "没有" || echo "有了")
  echo -n "看上去项目上游主线分支${word}更新……"

  if [[ "$remoteID" != "$localID" ]]
  then
    if [[ "$localID" != "$currentID" ]]
    then
      echo -n "而且本地当前分支也有了提交，"
    fi

    echo "到下面的地址看看吧！"
    echo
    echo "$remoteUrl"
  else
    echo
  fi
}
