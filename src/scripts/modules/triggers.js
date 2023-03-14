const visitedPagesKey = 'pages-list'

const sessionSavingsInterval = 10000
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
  }
}

function init() {
  if (!interval) {
    interval = setInterval(() => {
      const visitedPages = localStorage.getItem(visitedPagesKey)
      const currentPage = window.location.pathname
      const currentTime = Date.now()

      sessionObject['visited'] = visitedPages ? JSON.parse(visitedPages) : {}
      if (Object.keys(sessionObject.visited).includes(currentPage)) {
        const lastLoaded = sessionObject['visited'][currentPage].loaded
          ? sessionObject['visited'][currentPage].loaded
          : 0
        updatePageInfo(
          sessionObject.visited,
          currentPage,
          'duration',
          currentTime - lastLoaded,
          (from, to) => from + to
        )
        updatePageInfo(sessionObject.visited, currentPage, 'loaded', currentTime, (from, to) => to)
        updatePageInfo(
          sessionObject.visited,
          currentPage,
          'maxScroll',
          window.scrollY / window.innerHeight,
          (from, to) => (to > from ? to : from)
        )
      } else {
        sessionObject['visited'][currentPage] = {
          duration: 0,
          loaded: currentTime,
          maxScroll: window.scrollY / window.innerHeight,
        }
      }

      const trigger = createTrigger(sessionObject)
      if (trigger) {
        chooseReaction(trigger, sessionObject)
      }
      localStorage.setItem(visitedPagesKey, JSON.stringify(sessionObject.visited))
    }, sessionSavingsInterval)
  }
}

try {
  init()
} catch (error) {
  console.error(error)
}
