// константы
const STORAGE_KEY = 'color-theme'

const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
}
const DEFAULT_THEME = THEMES.AUTO

const PREFERS_MQ = '(prefers-color-scheme)'
const PREFERS_MQ_DARK = '(prefers-color-scheme: dark)'
const PREFERS_MQ_DEFAULT = '(prefers-color-scheme: light), (prefers-color-scheme: no-preference)'

const buttonItemSelector = '.theme-toggle__item'
const buttonItemActiveClass = 'theme-toggle__item--is-active'

// DOM-элементы
const toggleElement = document.querySelector('.theme-toggle')
const darkThemeStyles = document.head.querySelector('link[media="(prefers-color-scheme: dark)"]')

const store = localStorage;

// Функции
function isPrefersColorSchemeSupported() {
  return window.matchMedia(PREFERS_MQ).media !== 'not all'
}

function hasStoredTheme() {
  return !!store.getItem(STORAGE_KEY)
}

function getCurrentTheme() {
  const storedTheme = store.getItem(STORAGE_KEY)

  const themeByCriteria = [
    [() => !!storedTheme, storedTheme],
    [() => !isPrefersColorSchemeSupported(), DEFAULT_THEME],
    [() => window.matchMedia(PREFERS_MQ_DEFAULT).matches, DEFAULT_THEME],
    [() => window.matchMedia(PREFERS_MQ_DARK).matches, THEMES.DARK],
    [() => true, DEFAULT_THEME],
  ]

  const [,theme] = themeByCriteria.find(([criteria]) => criteria())
  return theme
}

function setCurrentTheme(theme) {
  if (theme === THEMES.AUTO) {
    store.removeItem(STORAGE_KEY)
  } else {
    store.setItem(STORAGE_KEY, theme)
  }
}

function toggleTheme(event) {
  const button = event.target.closest(buttonItemSelector)

  if (!button) {
    return
  }

  const newTheme = button.value

  setCurrentTheme(newTheme)
  applyTheme(newTheme)
}

function applyTheme(theme = getCurrentTheme()) {
  const mediaMap = {
    [THEMES.AUTO]: '(prefers-color-scheme: dark)',
    [THEMES.LIGHT]: 'not all',
    [THEMES.DARK]: 'all',
  }

  darkThemeStyles.media = mediaMap[theme]
  toggleElement
    .querySelectorAll(buttonItemSelector)
    .forEach(item => {
      item.classList.toggle(buttonItemActiveClass, item.value === theme)
    })
}

// Инициализация
toggleElement.addEventListener('click', toggleTheme)

if (hasStoredTheme()) {
  applyTheme()
}
