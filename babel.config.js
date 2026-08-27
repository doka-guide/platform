// Проектный конфиг вместо .babelrc: последний применяется только к файлам
// внутри пакета и не действует на node_modules. Это важно для jest —
// jsdom 30 тянет ESM-пакет @exodus/bytes, который приходится трансформировать.
module.exports = {
  presets: ['@babel/preset-env'],
}
