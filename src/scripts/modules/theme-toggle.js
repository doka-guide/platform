// константы
const STORAGE_KEY = 'color-theme'

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto',
}

// DOM-элементы
let toggleElement
const darkThemeStyles = document.head.querySelector('link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]')
const lightThemeMeta = document.head.querySelector('meta[name=theme-color][media*=prefers-color-scheme][media*=light]')
const darkThemeMeta = document.head.querySelector('meta[name=theme-color][media*=prefers-color-scheme][media*=dark]')

const themeColorMetaElements = {
  [THEMES.LIGHT]: lightThemeMeta,
  [THEMES.DARK]: darkThemeMeta,
}

const metaColors = {
  [THEMES.LIGHT]: lightThemeMeta.content,
  [THEMES.DARK]: darkThemeMeta.content,
}

const store = localStorage

// Функции
function hasStoredTheme() {
  return !!store.getItem(STORAGE_KEY)
}

function getCurrentTheme() {
  const storedTheme = store.getItem(STORAGE_KEY)
  return storedTheme || THEMES.AUTO
}

function setCurrentTheme(theme) {
  store.setItem(STORAGE_KEY, theme)
}

function toggleTheme(event) {
  const newTheme = event.target?.value

  if (!newTheme) {
    return
  }

  setCurrentTheme(newTheme)
  applyTheme(newTheme)
}

function applyTheme(theme = getCurrentTheme()) {
  const darkStyleMediaMap = {
    [THEMES.AUTO]: '(prefers-color-scheme: dark)',
    [THEMES.LIGHT]: 'not all',
    [THEMES.DARK]: 'all',
  }

  if (darkThemeStyles) {
    darkThemeStyles.media = darkStyleMediaMap[theme]
  }

  if (toggleElement) {
    toggleElement.querySelector(`[value="${theme}"]`).checked = true
  }

  for (const [colorTheme, themeColorElement] of Object.entries(themeColorMetaElements)) {
    themeColorElement.content = metaColors[theme === THEMES.AUTO ? colorTheme : theme]
  }
}

// Инициализация
if (hasStoredTheme()) {
  applyTheme()
}

document.addEventListener('DOMContentLoaded', () => {
  toggleElement = document.querySelector('.theme-toggle')
  toggleElement?.addEventListener('change', toggleTheme)

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) {
      return
    }

    const newTheme = event.newValue

    if (!newTheme) {
      return
    }

    applyTheme(newTheme)
  })

  applyTheme()
})
