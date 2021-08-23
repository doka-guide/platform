// константы
const STORAGE_KEY = 'color-theme'

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
}

// DOM-элементы
const toggleElement = document.querySelector('.theme-toggle')
const darkThemeStyles = document.head.querySelector('link[rel=stylesheet][media*=prefers-color-scheme][media*=dark]')

const store = localStorage;

// Функции
function hasStoredTheme() {
  return !!store.getItem(STORAGE_KEY)
}

function getCurrentTheme() {
  const storedTheme = store.getItem(STORAGE_KEY)
  return storedTheme || THEMES.AUTO
}

function setCurrentTheme(theme) {
  if (theme === THEMES.AUTO) {
    store.removeItem(STORAGE_KEY)
  } else {
    store.setItem(STORAGE_KEY, theme)
  }
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

  darkThemeStyles.media = darkStyleMediaMap[theme]
  toggleElement.querySelector(`[value="${theme}"]`).checked = true
}

// Инициализация
toggleElement.addEventListener('change', toggleTheme)

window.addEventListener('storage', event => {
  if (event.key !== STORAGE_KEY) {
    return
  }

  const newTheme = event.newValue

  if (!newTheme) {
    return
  }

  applyTheme(newTheme)
})

// TODO: перенести в inline-скрипты для избежания миганий
if (hasStoredTheme()) {
  applyTheme()
}
