const fs = require('fs')
const path = require('path')
const readline = require('readline')
const util = require('util')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
const question = util.promisify(rl.question).bind(rl)

const { defaultPathToContent, contentRepFolders } = require('./config/constants.js')

const SYMLINKS_DEST = contentRepFolders.map((folder) => path.join('src', folder))

const existingSymlinks = SYMLINKS_DEST.filter((dest) => {
  try {
    return fs.readlinkSync(dest)
  } catch (e) {
    return false
  }
})

const existingFolders = SYMLINKS_DEST.filter((dest) => {
  try {
    return fs.readdirSync(dest)
  } catch (e) {
    return false
  }
})

const createLinks = (contentPath, link) => {
  console.log(`Проверяю, установлены ли символические ссылки к ${SYMLINKS_DEST.join(', ')}`)

  existingSymlinks.forEach((dest) => {
    console.log(`Удаляю старую ссылку ${dest}`)
    fs.unlinkSync(dest)
  })

  existingFolders.forEach((dest) => {
    console.log(`Удаляю старый каталог ${dest}`)
    fs.rmSync(dest, { recursive: true, force: true })
  })

  console.log('Создаю симлинки:')
  // если путь относительный, то считаем его от корня репозитория платформы
  if (!path.isAbsolute(contentPath)) {
    contentPath = path.relative('src', contentPath)
  }

  if (link) {
    fs.symlinkSync(path.join(contentPath, 'settings'), path.join('src', 'settings'), 'junction')
    console.log(`${contentPath}/settings → src/settings`)

    const categoryPath = path.join('src', link.split('/')[0])
    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath)
    }
    fs.symlinkSync(path.join(`../${contentPath}`, link), path.join('src', link), 'junction')
    console.log(`${contentPath}/${link} → src/${link}`)
    console.log(`При настройках по умолчанию материал доступен по ссылке: http://localhost:8080/${link}`)
  } else {
    SYMLINKS_DEST.forEach((dest, i) => {
      const source = path.join(contentPath, contentRepFolders[i])
      console.log(`${dest} → ${source}`)
      fs.symlinkSync(source, dest, 'junction')
    })
  }

  console.log('✅ Готово')
}

const pathRequest = async () => {
  try {
    const answer = await question(
      `Укажите путь к репозиторию с контентом (нажмите Enter, если это '${defaultPathToContent}'): `
    )
    return answer.trim() || defaultPathToContent
  } catch (err) {
    console.error('Ошибка: вопрос отклонен', err)
  }
}

const buildTypeRequest = async () => {
  try {
    const answer = await question(
      `Укажите относительный путь к материалу в формате 'раздел/папка' (нажмите Enter, если хотите собрать сайт со всеми материалами): `
    )
    return answer.trim()
  } catch (err) {
    console.error('Ошибка: вопрос отклонен', err)
  }
}

const create = async () => {
  if (process.env.PATH_TO_CONTENT) {
    console.log('Использую настройки из .env')
    createLinks(process.env.PATH_TO_CONTENT)
  } else {
    const contentPath = await pathRequest()
    const materialPath = await buildTypeRequest()
    if (materialPath) {
      createLinks(contentPath, materialPath)
    } else {
      createLinks(contentPath)
    }
  }
  rl.close()
}

create()
