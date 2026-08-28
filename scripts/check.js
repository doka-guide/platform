#!/usr/bin/env node

// Один прогон всех быстрых проверок: тесты и линтеры.
//
// Отличие от `npm run lint-check` в том, что проверки не прерывают друг друга.
// В lint-check шаги склеены через `&&`: если падает editorconfig, до stylelint
// и eslint дело не доходит вообще, и в выводе видно ошибки про переводы строк
// вместо реальных проблем в коде. Здесь каждая проверка отрабатывает до конца,
// а итог собирается в таблицу — так же, как в CI, где шаги идут через
// `if: !cancelled()`.
//
// Проверки разметки здесь нет: `lint:html` работает по собранному `dist` и
// требует Java, то есть это не быстрый цикл. Запускайте её отдельно после
// `npm run build`.

'use strict'

const { spawnSync } = require('child_process')

const CHECKS = [
  ['Тесты', ['test']],
  ['editorconfig', ['run', 'editorconfig']],
  ['Линтер CSS', ['run', 'lint:css']],
  ['Линтер JS', ['run', 'lint:js']],
]

const results = []

for (const [name, args] of CHECKS) {
  console.log(`\n──── ${name} ────`)
  const { status } = spawnSync('npm', args, { stdio: 'inherit', shell: process.platform === 'win32' })
  results.push([name, status === 0])
}

console.log('\n──── Итог ────')
for (const [name, ok] of results) {
  console.log(`${ok ? '✓' : '✗'} ${name}`)
}

const failed = results.filter(([, ok]) => !ok)

if (failed.length > 0) {
  console.error(`\nПровалено проверок: ${failed.length} из ${results.length}.`)
  process.exitCode = 1
} else {
  console.log('\nВсе проверки прошли.')
}
