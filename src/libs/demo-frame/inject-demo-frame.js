const fs = require('fs')
const path = require('path')
const frontMatter = require('gray-matter')
const categoryColors = require('../../../config/category-colors')
const { transformDemoHtml } = require('./transform-demo-html')

const ROOT_DIR = path.join(__dirname, '..', '..', '..')
const DIST_DIR = path.join(ROOT_DIR, 'dist')
const SRC_DIR = path.join(ROOT_DIR, 'src')

/**
 * Ищет входные HTML-файлы демок — только demos/{имя}/index.html, ровно один
 * уровень вложенности под demos/. Внутренние страницы демок (вложенная
 * навигация, встроенные iframe с превью кода и т. п.) сознательно не трогаем:
 * у них нет своей отдельной "статьи-владельца", и чужая шапка/подвал там
 * не нужны.
 *
 * @param {string} rootDir
 * @returns {string[]}
 */
function findDemoEntryFiles(rootDir) {
  const results = []

  function walk(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const fullPath = path.join(dir, entry.name)

      if (entry.name === 'demos') {
        let demoDirs = []
        try {
          demoDirs = fs.readdirSync(fullPath, { withFileTypes: true })
        } catch {
          demoDirs = []
        }

        for (const demoDir of demoDirs) {
          if (!demoDir.isDirectory()) {
            continue
          }

          const indexPath = path.join(fullPath, demoDir.name, 'index.html')
          if (fs.existsSync(indexPath)) {
            results.push(indexPath)
          }
        }

        continue
      }

      walk(fullPath)
    }
  }

  walk(rootDir)
  return results
}

/**
 * По пути dist/{section}/{slug}/demos/{name}/index.html находит исходную
 * статью и автора, чтобы собрать данные для шапки/подвала демки.
 * Если статья или автор не резолвятся — возвращает null, вызывающий код
 * должен пропустить такой файл, не обрушая сборку.
 *
 * @param {string} demoEntryPath
 * @param {{ distDir: string, srcDir: string }} dirs
 * @returns {{ section: string, slug: string, authorUsername: string, authorName: string, accent: string } | null}
 */
function resolveDemoData(demoEntryPath, { distDir, srcDir } = { distDir: DIST_DIR, srcDir: SRC_DIR }) {
  const relFromDist = path.relative(distDir, demoEntryPath)
  const parts = relFromDist.split(path.sep)
  const demosIndex = parts.indexOf('demos')

  if (demosIndex < 2) {
    return null
  }

  const articleRelParts = parts.slice(0, demosIndex)
  const [section] = articleRelParts
  const slug = articleRelParts.slice(1).join('/')

  const articleMdPath = path.join(srcDir, ...articleRelParts, 'index.md')
  if (!fs.existsSync(articleMdPath)) {
    return null
  }

  let articleData
  try {
    articleData = frontMatter(fs.readFileSync(articleMdPath, 'utf-8')).data
  } catch {
    return null
  }

  const authors = articleData.authors
  const authorUsername = Array.isArray(authors) ? authors[0] : authors
  if (!authorUsername) {
    return null
  }

  let authorName = authorUsername
  try {
    const personMdPath = path.join(srcDir, 'people', authorUsername, 'index.md')
    authorName = frontMatter(fs.readFileSync(personMdPath, 'utf-8')).data.name || authorUsername
  } catch {
    // Профиль автора не резолвится — используем логин, сборку не обрушаем.
  }

  const { light: accent } = categoryColors[section] || categoryColors.default

  return { section, slug, authorUsername, authorName, accent }
}

/**
 * Проходит по всем демкам в dist/ и внедряет в них автоматическую шапку/подвал.
 */
async function injectDemoFrame() {
  const demoFiles = findDemoEntryFiles(DIST_DIR)

  for (const filePath of demoFiles) {
    const data = resolveDemoData(filePath, { distDir: DIST_DIR, srcDir: SRC_DIR })
    if (!data) {
      continue
    }

    const html = fs.readFileSync(filePath, 'utf-8')
    const updatedHtml = transformDemoHtml(html, data)
    fs.writeFileSync(filePath, updatedHtml)
  }
}

module.exports = { injectDemoFrame, findDemoEntryFiles, resolveDemoData }
