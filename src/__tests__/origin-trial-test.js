const fs = require('fs')
const path = require('path')

const meta = fs.readFileSync(path.join(__dirname, '../includes/meta.njk'), 'utf8')

// Токен в base64: байт версии, 64 байта подписи, 4 байта длины, затем JSON с адресом, функцией и сроком.
// Искать начало JSON по «{» нельзя: такой байт попадается и в подписи.
function readToken() {
  const [, token] = meta.match(/<meta http-equiv="origin-trial" content="([^"]+)">/) || []
  const bytes = Buffer.from(token, 'base64')
  const length = bytes.readUInt32BE(65)
  return JSON.parse(bytes.subarray(69, 69 + length).toString('utf8'))
}

test('токен пробной версии WebMCP выдан на doka.guide и поддомены', () => {
  expect(readToken()).toMatchObject({
    origin: 'https://doka.guide:443',
    feature: 'WebMCP',
    isSubdomain: true,
  })
})

// Просроченный токен Chrome молча игнорирует, и инструменты пропадают у всех.
// Тест падает в день окончания: продлите токен на developer.chrome.com/origintrials
// или уберите тег, если WebMCP уже включён в Chrome по умолчанию.
test('токен пробной версии WebMCP не просрочен', () => {
  expect(readToken().expiry * 1000).toBeGreaterThan(Date.now())
})
