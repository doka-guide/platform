const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const SCRIPT = path.join(__dirname, '..', 'make-links.js')

// Скрипт спрашивает путь к контенту и материал через readline. Ответ пишем,
// только когда появился вопрос: если отдать оба ответа сразу, readline
// прочтёт обе строки до второго вопроса, и второй ответ потеряется.
function runInteractive(cwd, answers) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SCRIPT], {
      cwd,
      env: { ...process.env, PATH_TO_CONTENT: '', NODE_ENV: 'test' },
    })
    let asked = 0
    let output = ''
    child.stdout.on('data', (chunk) => {
      output += chunk
      const questions = output.split('Укажите').length - 1
      while (asked < questions && asked < answers.length) {
        child.stdin.write(`${answers[asked]}\n`)
        asked += 1
      }
    })
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('error', reject)
    child.on('close', (code) => (code === 0 ? resolve(output) : reject(new Error(output))))
  })
}

function makeContent(root) {
  fs.mkdirSync(path.join(root, 'settings'), { recursive: true })
  fs.mkdirSync(path.join(root, 'css', 'flex'), { recursive: true })
  fs.writeFileSync(path.join(root, 'css', 'flex', 'index.md'), '# flex\n')
}

describe('make-links: режим одного материала', () => {
  let tmp

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'make-links-'))
    fs.mkdirSync(path.join(tmp, 'platform', 'src'), { recursive: true })
    makeContent(path.join(tmp, 'content'))
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  test('относительный путь к контенту даёт рабочую ссылку на материал', async () => {
    const platform = path.join(tmp, 'platform')
    await runInteractive(platform, ['../content', 'css/flex'])

    expect(fs.existsSync(path.join(platform, 'src', 'css', 'flex', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(platform, 'src', 'settings'))).toBe(true)
  })

  test('абсолютный путь к контенту даёт рабочую ссылку на материал', async () => {
    const platform = path.join(tmp, 'platform')
    await runInteractive(platform, [path.join(tmp, 'content'), 'css/flex'])

    expect(fs.existsSync(path.join(platform, 'src', 'css', 'flex', 'index.md'))).toBe(true)
    expect(fs.existsSync(path.join(platform, 'src', 'settings'))).toBe(true)
  })
})
