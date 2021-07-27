// константы
const STORAGE_KEY = 'theme'
const THEMES = {
  DARK: 'dark',
  LIGHT: 'light'
}
const DEFAULT_THEME = THEMES.LIGHT
const PREFERS_MQ = '(prefers-color-scheme)'
const PREFERS_MQ_DARK = '(prefers-color-scheme: dark)'
const PREFERS_MQ_DEFAULT = '(prefers-color-scheme: light), (prefers-color-scheme: no-preference)'

const LIGHT_THEME_CSS_CLASS = 'theme_color_light'
const DARK_THEME_CSS_CLASS = 'theme_color_dark'

// DOM-элементы
const rootElement = document.documentElement
const toggleElement = document.querySelector('.theme-toggle')

// Функции
function isPrefersColorSchemeSupported() {
  return window.matchMedia(PREFERS_MQ).media !== 'not all'
}

function hasStoredTheme() {
  return !!localStorage.getItem(STORAGE_KEY)
}

function getCurrentTheme() {
  const theme = localStorage.getItem(STORAGE_KEY)

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
  localStorage.setItem(STORAGE_KEY, theme)
}

function toggleTheme() {
  const currentTheme = getCurrentTheme()
  const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK

  setCurrentTheme(newTheme)
  applyTheme(newTheme)
}

function applyTheme(theme = getCurrentTheme()) {
  rootElement.classList.toggle(LIGHT_THEME_CSS_CLASS, THEMES.LIGHT === theme)
  rootElement.classList.toggle(DARK_THEME_CSS_CLASS, THEMES.DARK === theme)

  toggleElement.setAttribute('aria-pressed', THEMES.DARK === theme)
}

// Инициализация
toggleElement.addEventListener('click', toggleTheme)

if (isPrefersColorSchemeSupported() && !hasStoredTheme()) {
  window.matchMedia(PREFERS_MQ_DARK).addEventListener('change', event => {
    const newTheme = event.matches ? THEMES.DARK : THEMES.LIGHT
    applyTheme(newTheme)
  })
}

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

applyTheme()
