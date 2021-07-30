// константы
const STORAGE_KEY = 'color-theme'

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
}
const DEFAULT_THEME = THEMES.LIGHT

const PREFERS_MQ = '(prefers-color-scheme)'
const PREFERS_MQ_DARK = '(prefers-color-scheme: dark)'
const PREFERS_MQ_DEFAULT = '(prefers-color-scheme: light), (prefers-color-scheme: no-preference)'

// DOM-элементы
const toggleElement = document.querySelector('.theme-toggle')
const darkThemeStyles = document.head.querySelector('link[media="(prefers-color-scheme: dark)"]')

const store = sessionStorage;

// Функции
function isPrefersColorSchemeSupported() {
  return window.matchMedia(PREFERS_MQ).media !== 'not all'
}

function hasStoredTheme() {
  return !!store.getItem(STORAGE_KEY)
}

function getCurrentTheme() {
  const theme = store.getItem(STORAGE_KEY)

  if (theme) {
    return theme
  }

  switch (true) {
    case (!isPrefersColorSchemeSupported()):
    case (window.matchMedia(PREFERS_MQ_DEFAULT).matches): {
      return DEFAULT_THEME
    }

    case (window.matchMedia(PREFERS_MQ_DARK).matches): {
      return THEMES.DARK
    }

    default: {
      return DEFAULT_THEME
    }
  }
}

function setCurrentTheme(theme) {
  store.setItem(STORAGE_KEY, theme)
}

function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK

  setCurrentTheme(newTheme)
  applyTheme(newTheme)
}

function applyTheme(theme = getCurrentTheme()) {
  const isDarkTheme = THEMES.DARK === theme

  darkThemeStyles.media = isDarkTheme ? 'all' : 'none'
  toggleElement.setAttribute('aria-pressed', isDarkTheme)
}

// Инициализация
toggleElement.addEventListener('click', toggleTheme)

if (hasStoredTheme()) {
  applyTheme()
}
