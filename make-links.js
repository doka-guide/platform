const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { defaultPathToContent, contentRepFolders } = require('./config/constants.js')

const SYMLINKS_DEST = contentRepFolders.map((folder) => path.join('src', folder))

const existingSymlinks = SYMLINKS_DEST.filter((dest) => {
  try {
    return fs.readlinkSync(dest)
  } catch (e) {
    return false
  }
})

const createLinks = (contentPath) => {
  console.log(`Проверяю, установлены ли символические ссылки к ${SYMLINKS_DEST.join(', ')}`)

  existingSymlinks.forEach((dest) => {
    console.log(`Удаляю старую ссылку ${dest}`)
    fs.unlinkSync(dest)
  })

  console.log('Создаю симлинки:')
  // если путь относительный, то считаем его от корня репозитория платформы
  if (!path.isAbsolute(contentPath)) {
    contentPath = path.relative('src', contentPath)
  }
  SYMLINKS_DEST.forEach((dest, i) => {
    const source = path.join(contentPath, contentRepFolders[i])
    console.log(`${dest} → ${source}`)
    fs.symlinkSync(source, dest, 'junction')
  })

  console.log('✅ Готово')
}

if (process.env.PATH_TO_CONTENT) {
  console.log('Использую настройки из .env')
  createLinks(process.env.PATH_TO_CONTENT)
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question(
    `Укажите путь к репозиторию с контентом (нажмите Enter, если это '${defaultPathToContent}'):`,
    (answer) => {
      const contentPath = answer.trim() || defaultPathToContent
      createLinks(contentPath)
      rl.close()
    }
  )
}
