function init() {
  const banner = document.querySelector('.top-banner')
  const button = banner?.querySelector('.top-banner__button')
  const interval = 10000
  const visitedPagesKey = 'pages-list'

  if (!banner && !button) {
    return
  }

  const storageKey = 'top-banner'

  try {
    const isCookieAccepted = JSON.parse(localStorage.getItem(storageKey))

    if (isCookieAccepted) {
      return
    }

    const visitedPages = localStorage.getItem(visitedPagesKey)
    const pageList = visitedPages ? JSON.parse(visitedPages) : {}

    let timer = setInterval(() => {
      if (pageList) {
        for (const key in pageList) {
          if (pageList[key].duration >= interval * 2) {
            banner.hidden = false
            clearInterval(timer)
            break
          }
        }
      }
    }, interval)
  } catch (error) {
    console.error(error)
  }

  button.addEventListener(
    'click',
    () => {
      banner.hidden = true
      localStorage.setItem(storageKey, true)
    },
    { once: true },
  )
}

init()
