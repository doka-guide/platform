const visitedPagesKey = 'pages-list'

const updatePeriod = 10000
const sessionObject = {}

let interval = null

function setTrigger() {
  const currentPopupStatus = localStorage.getItem('subscription-form-status')
  const currentCookieStatus = localStorage.getItem('cookie-notification')

  if (currentPopupStatus && currentCookieStatus && currentPopupStatus === 'LOADED' && currentCookieStatus === 'true') {
    localStorage.setItem('subscription-form-status', 'PENDING')
  }
}

const pagesAmountEnoughTrigger = 'pages-amount-enough'

const reactionsObject = {}
reactionsObject[pagesAmountEnoughTrigger] = () => setTrigger()

function createTrigger(sessionObject) {
  const visited = sessionObject.visited
  if (visited) {
    const pages = Object.keys(visited)
    if (pages.length > 5) {
      return pagesAmountEnoughTrigger
    }
  }
}

function chooseReaction(trigger, sessionObject) {
  reactionsObject[trigger](sessionObject)
}

function updatePageInfo(object, page, key, to, action) {
  const from = object[page][key]
  if (from) {
    object[page][key] = action(from, to)
  } else {
    object[page][key] = to
  }
}

function init() {
  if (!interval) {
    interval = setInterval(() => {
      const visitedPages = localStorage.getItem(visitedPagesKey)
      const currentPage = window.location.pathname
      const currentTime = Date.now()
      const scrollDeepness = window.scrollY / document.getElementsByTagName('body')[0].clientHeight

      sessionObject['visited'] = visitedPages ? JSON.parse(visitedPages) : {}
      if (Object.keys(sessionObject.visited).includes(currentPage)) {
        updatePageInfo(sessionObject.visited, currentPage, 'duration', updatePeriod, (from, to) => from + to)
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
      }
      localStorage.setItem(visitedPagesKey, JSON.stringify(sessionObject.visited))
    }, updatePeriod)
  }
}

try {
  init()
} catch (error) {
  console.error(error)
}
