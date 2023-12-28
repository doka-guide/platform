function init() {
  const banner = document.querySelector('.cookie-notification')
  const button = banner?.querySelector('button')

  if (!banner && !button) {
    return
  }

  const storageKey = 'cookie-notification'

  try {
    const isCookieAccepted = JSON.parse(localStorage.getItem(storageKey))

    if (isCookieAccepted) {
      return
    }
  } catch (error) {
    console.error(error)
  }

  banner.hidden = false

  button.addEventListener(
    'click',
    () => {
      banner.hidden = true
      localStorage.setItem(storageKey, true)
    },
    { once: true }
  )
}

init()
