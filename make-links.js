const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { defaultPathToContent, contentRepFolders } = require("./config/constants.js")

const SYMLINKS_DEST = contentRepFolders.map(folder => path.join('src', folder))

const existingSymlinks = SYMLINKS_DEST.filter((dest) => {
  try {
    return fs.readlinkSync(dest)
  } catch (e) {
    return false
  }
})

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
    const source = path.join(contentPath, contentRepFolders[i])
    console.log(`${dest} → ${source}`)
    try {
      fs.symlinkSync(source, dest);
    } catch (e) {
      fs.symlinkSync(source, dest, 'junction');
    }
  })

  console.log('✅ Готово')
}

let contentPath = defaultPathToContent
if (process.argv[2] === '--default') {
  console.log('Использую настройки из .env')
  createLinks(contentPath)
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(`Укажите путь к репозиторию с контентом (нажмите Enter, если это '${defaultPathToContent}'):`, (answer) => {
    contentPath = answer.trim() || defaultPathToContent
    if (!path.isAbsolute(contentPath)) {
      contentPath = path.relative('src', contentPath)
    }
    createLinks(contentPath)
    rl.close()
  })
}
