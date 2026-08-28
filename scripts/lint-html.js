#!/usr/bin/env node

// Проверяет валидность разметки, которую выдаёт платформа.
//
// Проверяется по одной странице каждого типа, а не весь сайт. Причина в том,
// что платформа отвечает за шаблоны, а не за контент: все статьи рендерятся
// одним и тем же doc.njk, и тысячная статья не скажет ничего, чего не сказала
// первая. Ошибки в авторской разметке — например, в HTML демок — это забота
// репозитория контента, и тащить их в проверки платформы незачем.
//
// Раньше проверка была устроена глобом `./dist/**/*.html` без кавычек. Его
// разворачивал sh, который не умеет globstar, поэтому `**` схлопывался в `*`
// и до валидатора доезжали 27 страниц из 3495 — одни индексы разделов, ни
// одной статьи. То есть весь слой шаблонов статей не проверялся вообще.

'use strict'

const path = require('path')
const { existsSync } = require('fs')
const { vnu } = require('vnu-jar')

const DIST = 'dist'

// По одному представителю на каждый тип страницы. Если добавляется новый вид
// страницы — добавляйте его сюда, иначе он останется без проверки.
const PAGES = [
  ['index.html', 'главная'],
  ['css/index.html', 'индекс раздела'],
  ['all/index.html', 'список всех статей'],
  ['people/index.html', 'список участников'],
  ['people/solarrust/index.html', 'страница участника'],
  ['search/index.html', 'поиск'],
  ['about/index.html', 'служебная страница'],
  ['subscribe/index.html', 'страница подписки'],
  ['offline/index.html', 'страница офлайна'],
  ['404/index.html', 'страница ошибки'],
  ['css/display/index.html', 'статья со всеми трансформациями'],
  ['css/index.sc.html', 'социальная карточка раздела'],
  ['css/display/index.sc.html', 'социальная карточка статьи'],
  ['all/index.sc.html', 'социальная карточка списка статей'],
]

function main() {
  const missing = PAGES.filter(([file]) => !existsSync(path.join(DIST, file)))

  if (missing.length > 0) {
    // Пропавшая страница — это тоже поломка: либо сборка перестала её делать,
    // либо тип страницы переименовали и список пора обновить.
    console.error('Не найдены страницы для проверки:')
    for (const [file, kind] of missing) {
      console.error(`  ${file} — ${kind}`)
    }
    process.exitCode = 1
    return
  }

  const files = PAGES.map(([file]) => path.join(DIST, file))

  console.log(`Проверяется ${files.length} страниц — по одной каждого типа.`)

  vnu
    .check(['--format', 'gnu', '--exit-zero-always', ...files])
    .then((output) => {
      const lines = output.split('\n').filter((line) => line.trim() !== '')
      // Предупреждения валидатора — советы по разметке вроде «у секции нет
      // заголовка». Показываем их, но проверку из-за них не роняем: страницы
      // социальных карточек существуют только под скриншот, и заголовки там
      // не нужны.
      const errors = lines.filter((line) => /: error/.test(line))
      const warnings = lines.filter((line) => !/: error/.test(line))

      for (const line of warnings) {
        console.log(line)
      }

      if (errors.length === 0) {
        console.log(`\nОшибок нет. Предупреждений: ${warnings.length}.`)
        return
      }

      console.error('')
      for (const line of errors) {
        console.error(line)
      }
      console.error(`\nОшибок: ${errors.length}.`)
      process.exitCode = 1
    })
    .catch((error) => {
      const message = error.message.trim()

      if (message.includes('UnsupportedClassVersionError')) {
        // vnu-jar считает подходящей любую Java начиная с 11, хотя сам jar
        // собран под 17. На машине с Java 11–16 он берёт системную и падает
        // с невнятной ошибкой про версию класса.
        console.error('Валидатору нужна Java 17 или новее, а в PATH оказалась более старая.')
        console.error('Поставьте Java 17+ или уберите старую из PATH — тогда vnu-jar скачает свою.')
      } else {
        console.error(message)
      }

      process.exitCode = 1
    })
}

main()
