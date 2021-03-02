#!/bin/bash

DEFAULT_PATH_TO_CONTENT="../content"
symlinksTo=("html" "css" "js")
shouldSetSymlinks=false
pwd

# если, что ссылки установлены
for symlink in ${symlinksTo[*]}; do
  if [ ! -L "$symlink" ]; then
    shouldSetSymlinks=true
    break
  fi
done

# если все ссылки уже проставлены, то не делаем ничего
if [ $shouldSetSymlinks = false ]; then
  exit 0
fi

# ссылок нет, спросим путь до директории
read -p "Укажите путь к репозиторию с контентом [нажми Enter, если это $DEFAULT_PATH_TO_CONTENT]:" PATH_TO_CONTENT

if [ "$PATH_TO_CONTENT" = "" ]; then
  PATH_TO_CONTENT=$DEFAULT_PATH_TO_CONTENT
fi

# проставляем симлинки
for symlink in ${symlinksTo[*]}; do
  source="$PATH_TO_CONTENT/$symlink"

  # если нам дали относительный путь к контенту, добавим дополнительный шаг вверх,
  # так как мы линк на одну директорию глубже, чем мы сейчас
  if [[ ! $source = /* ]]; then
    source="../$source"
  fi

  ln -sf "$source" "src/$symlink"
done
