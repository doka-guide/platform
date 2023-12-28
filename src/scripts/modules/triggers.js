const visitedPagesKey = 'pages-list'

const updatingPeriod = 10000
const sessionObject = {}

// Реакция на триггер по умолчанию
function setTrigger() {
  const currentPopupStatus = localStorage.getItem('subscription-form-status')
  const currentCookieStatus = localStorage.getItem('cookie-notification')

  if (currentPopupStatus && currentCookieStatus && currentPopupStatus === 'LOADED' && currentCookieStatus === 'true') {
    localStorage.setItem('subscription-form-status', 'PENDING')
  }
}

// Триггеры
const pageFromTheListTrigger = 'page-from-the-list'
const pagesAmountEnoughTrigger = 'pages-amount-enough'
const averageDurationEnoughTrigger = 'average-duration-enough'
const maxScrollDeepnessEnoughTrigger = 'max-scroll-deepness-enough'

const reactions = {}
reactions[pageFromTheListTrigger] = setTrigger
reactions[pagesAmountEnoughTrigger] = setTrigger
reactions[averageDurationEnoughTrigger] = setTrigger
reactions[maxScrollDeepnessEnoughTrigger] = setTrigger

const triggerPageList = ['/about/', '/people/', '/manifesto/']

function createTrigger(sessionObject) {
  const visited = sessionObject?.visited
  if (visited) {
    const pages = Object.keys(visited)
    for (let i = 0; i < pages.length; i++) {
      if (triggerPageList.includes(pages[i])) {
        return pageFromTheListTrigger
      }
    }
    if (pages.length > 5) {
      return pagesAmountEnoughTrigger
    }
    const averageDuration = Object.values(visited).reduce((a, v) => a + v.duration, 0) / pages.length
    if (averageDuration > updatingPeriod * 4.5) {
      return averageDurationEnoughTrigger
    }
    const maxScrollDeepness = Math.max(...Object.values(visited).map((v) => v.scrollDeepness))
    if (maxScrollDeepness > 0.5) {
      return maxScrollDeepnessEnoughTrigger
    }
  }
}

function chooseReaction(trigger, sessionObject) {
  reactions[trigger]?.(sessionObject)
}

function updatePageInfo(object, page, key, to, action) {
  const from = object[page][key]
  if (from) {
    object[page][key] = action(from, to)
  } else {
    object[page][key] = to
  }
}

const reset = init()
function init() {
  const interval = setInterval(() => {
    const visitedPages = localStorage.getItem(visitedPagesKey)
    const currentPage = window.location.pathname
    const currentTime = Date.now()
    const scrollDeepness = window.scrollY / document.getElementsByTagName('body')[0].clientHeight

    sessionObject['visited'] = visitedPages ? JSON.parse(visitedPages) : {}
    if (Object.keys(sessionObject.visited).includes(currentPage)) {
      updatePageInfo(sessionObject.visited, currentPage, 'duration', updatingPeriod, (from, to) => from + to)
      updatePageInfo(sessionObject.visited, currentPage, 'loaded', currentTime, (from, to) => to)
      updatePageInfo(sessionObject.visited, currentPage, 'scrollDeepness', scrollDeepness, (from, to) =>
        to > from ? to : from
      )
    } else {
      sessionObject['visited'][currentPage] = {
        duration: 0,
        loaded: currentTime,
        scrollDeepness: scrollDeepness,
      }
    }

    const trigger = createTrigger(sessionObject)
    if (trigger) {
      chooseReaction(trigger, sessionObject)
      reset()
    }
    localStorage.setItem(visitedPagesKey, JSON.stringify(sessionObject.visited))
  }, updatingPeriod)
  return () => clearInterval(interval)
}

try {
  init()
} catch (error) {
  console.error(error)
}
