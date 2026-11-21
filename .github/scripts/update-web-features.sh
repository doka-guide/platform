#!/bin/sh
# Открывает пулреквест со свежей версией web-features или обновляет уже открытый.
# Ветка одна на все версии: новая версия переписывает её, и пулреквест остаётся тем же.
set -eu

BRANCH=deps/web-features

current=$(node -p "require('./package-lock.json').packages['node_modules/web-features'].version")
latest=$(npm view web-features version)

if [ "$current" = "$latest" ]; then
  echo "В main уже последняя версия web-features: $latest"
  exit 0
fi

# Ставить пакеты не нужно: тесты на пулреквест запускают свои воркфлоу
npm install "web-features@$latest" --package-lock-only --no-audit --no-fund

title="Обновляет web-features до $latest"
body="Обновляет web-features с $current до $latest.

Что изменилось: https://github.com/web-platform-dx/web-features/releases/tag/v$latest

Пулреквест открывает воркфлоу «Update web-features». Вышла версия новее — он перепишет ветку и этот пулреквест."

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git switch -c "$BRANCH"
git commit -m "$title" -- package.json package-lock.json

# Без этой проверки каждый запуск переписывал бы ветку той же правкой и заново гонял CI
if git fetch origin "$BRANCH" 2>/dev/null && git diff --quiet FETCH_HEAD HEAD; then
  echo "Ветка $BRANCH уже содержит web-features $latest"
else
  git push --force origin "$BRANCH"
fi

pr=$(gh pr list --head "$BRANCH" --state open --json number --jq '.[0].number')
if [ -n "$pr" ]; then
  gh pr edit "$pr" --title "$title" --body "$body"
else
  gh pr create --base main --head "$BRANCH" --title "$title" --body "$body"
fi
