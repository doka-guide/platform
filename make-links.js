require('dotenv').config({ path: '.env' })

const fs = require('fs')
const path = require('path')
const readline = require('readline');

const DEFAULT_PATH_TO_CONTENT = process.env.PATH_TO_CONTENT
const CONTENT_REP_FOLDERS = process.env.CONTENT_REP_FOLDERS.split(', ')
const SYMLINKS_DEST = CONTENT_REP_FOLDERS.map(folder => path.join('src', folder))

const existingSymlinks = SYMLINKS_DEST.filter((dest) => {
  try {
    return fs.readlinkSync(dest)
  } catch (e) {
    return false
  }
})

console.log(existingSymlinks, SYMLINKS_DEST);
  
if (existingSymlinks.length === SYMLINKS_DEST.length) {
  console.log('Символические ссылки уже установлены')
  process.exit(0)
}

const createLinks = (contentPath) => {
  console.log(`Проверяю, установлены ли символические ссылки к ${SYMLINKS_DEST.join(', ')}`)
  
  existingSymlinks.forEach((dest) => {
    console.log(`Удаляю старую ссылку ${dest}`)
    fs.unlinkSync(dest)
  })

  console.log('Создаю симлинки:')
  SYMLINKS_DEST.forEach((dest, i) => {
    const source = path.join(contentPath, CONTENT_REP_FOLDERS[i])
    console.log(`${dest} → ${source}`)
    fs.symlinkSync(source, dest)
  })

  console.log('✅ Готово')
}

let contentPath = DEFAULT_PATH_TO_CONTENT
if (process.argv[2] === '--default') {
  console.log('Использую настройки из .env')
  createLinks(contentPath)
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(`Укажите путь к репозиторию с контентом [нажми Enter, если это '${DEFAULT_PATH_TO_CONTENT}']:`, (answer) => {
    contentPath = answer.trim() || DEFAULT_PATH_TO_CONTENT
    if (!path.isAbsolute(contentPath)) {
      contentPath = path.relative('src', contentPath)
    }
    createLinks(contentPath)
    rl.close()
  })
}
