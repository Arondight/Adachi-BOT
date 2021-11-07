#!/usr/bin/env bash

{
  remoteUrl='https://github.com/Arondight/Adachi-BOT.git'
  remoteBranch='master'

  remoteID=$(git ls-remote -qh "$remoteUrl" "$remoteBranch" 2>/dev/null | awk '{print $1}')
  localID=$(git rev-list HEAD | head -1)

  if [[ -z "$remoteID" ]]
  then
    echo "哎呀，网络不好，出错了……"
    exit 1
  fi

  word=$([[ "$remoteID" == "$localID" ]] && echo "没有" || echo "有了")
  echo "看上去项目上游主线分支${word}更新！"
}
