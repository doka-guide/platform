const fs = require('fs')
const path = require('path')
const readline = require('readline');

const DEFAULT_PATH_TO_CONTENT = path.join('..', 'content')
const CONTENT_FOLDERS = ['html', 'css', 'js']
const SYMLINKS_DEST = CONTENT_FOLDERS.map(folder => path.join('src', folder))

console.log(`Проверяю, установлены ли символические ссылки к ${SYMLINKS_DEST.join(', ')}`)
const existingSymlinks = SYMLINKS_DEST.filter((dest) => {
  try {
    fs.accessSync(dest)
    return true
  } catch (e) {
    return false
  }
})

if (existingSymlinks.length === SYMLINKS_DEST.length) {
  console.log('Символические ссылки уже установлены')
  process.exit(0)
}

existingSymlinks.forEach((dest) => {
  console.log(`Удаляю старую ссылку ${dest}`)
  fs.unlinkSync(dest)
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Укажите путь к репозиторию с контентом [нажми Enter, если это "${DEFAULT_PATH_TO_CONTENT}"]:`, (answer) => {
  let contentPath = answer.trim() || DEFAULT_PATH_TO_CONTENT
  if (!path.isAbsolute(contentPath)) {
    contentPath = path.relative('src', contentPath)
  }

  console.log('Создаю симлинки:')
  SYMLINKS_DEST.forEach((dest, i) => {
    const source = path.join(contentPath, CONTENT_FOLDERS[i])
    console.log(`${dest} → ${source}`)
    fs.symlinkSync(source, dest)
  })

  console.log('✅ Готово')
  rl.close()
});

