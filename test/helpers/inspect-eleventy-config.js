#!/usr/bin/env node

// Загружает .eleventy.js с заглушкой вместо объекта конфигурации и печатает
// в stdout сводку о том, что конфиг зарегистрировал.
//
// Запускается отдельным процессом, а не внутри jest: пакеты 11ty поставляются
// как ESM, jest грузит node_modules как CommonJS и падает на `import`, а
// обычный Node их переваривает — ровно так же, как настоящая сборка. Заодно это
// делает проверку честнее: если конфиг не грузится в Node, он не соберёт сайт.

'use strict'

const path = require('path')

const CONFIG_PATH = path.join(__dirname, '..', '..', '.eleventy.js')

const calls = {
  collections: [],
  filters: [],
  transforms: [],
  plugins: [],
  passthroughCopies: [],
  shortcodes: [],
  libraries: [],
}

const configSpy = {
  addCollection: (name, fn) => calls.collections.push({ name, isFunction: typeof fn === 'function' }),
  addFilter: (name, fn) => calls.filters.push({ name, isFunction: typeof fn === 'function' }),
  addTransform: (name, fn) => calls.transforms.push({ name, isFunction: typeof fn === 'function' }),
  addPlugin: (plugin) => calls.plugins.push({ type: typeof plugin }),
  addPassthroughCopy: (target) => calls.passthroughCopies.push(String(target)),
  addNunjucksShortcode: (name, fn) => calls.shortcodes.push({ name, isFunction: typeof fn === 'function' }),
  setLibrary: (name, lib) => calls.libraries.push({ name, hasRender: typeof lib?.render === 'function' }),
}

const configure = require(CONFIG_PATH)
const result = configure(configSpy)

// dotenv печатает в stdout свою строку про загруженные переменные, поэтому
// сводку отделяем маркером, а не полагаемся на чистоту вывода.
process.stdout.write('\n===ELEVENTY-CONFIG===\n' + JSON.stringify({ calls, result }))
