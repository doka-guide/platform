function init() {
  const banner = document.querySelector('.top-banner')
  const button = banner?.querySelector('.top-banner__button')
  const interval = 10000
  const visitedPagesKey = 'pages-list'
  const cookieNotificationKey = 'cookie-notification'
  const subscriptionPopupKey = 'subscription-form-status'

  if (!banner && !button) {
    return
  }

  const storageKey = 'top-banner'

  try {
    const isBannerAccepted = JSON.parse(localStorage.getItem(storageKey))

    if (isBannerAccepted) {
      return
    }

    const visitedPages = localStorage.getItem(visitedPagesKey)
    const cookieNotification = localStorage.getItem(cookieNotificationKey)
    const subscriptionPopup = localStorage.getItem(subscriptionPopupKey)
    const pageList = visitedPages ? JSON.parse(visitedPages) : {}

    let timer = setInterval(() => {
      if (pageList && cookieNotification && (subscriptionPopup === 'SHOWN' || subscriptionPopup === 'CLOSED')) {
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
