function formatRelativeDate(date, currentTime = new Date()) {
  let timeDiff = (currentTime - date) / 1000
  let piece

  const rtf = new Intl.RelativeTimeFormat('ru', {
    localeMatcher: 'best fit',
    numeric: 'always',
    style: 'long',
  })

  if (timeDiff >= 86400) {
    timeDiff = Math.round(timeDiff / 86400)
    piece = 'day'
  } else if (timeDiff >= 3600) {
    timeDiff = Math.round(timeDiff / 3600)
    piece = 'hour'
  } else if (timeDiff >= 60) {
    timeDiff = Math.round(timeDiff / 60)
    piece = 'minute'
  } else {
    timeDiff = Math.round(timeDiff)
    piece = 'second'
  }

  return rtf.format(-timeDiff, piece)
}

document.querySelectorAll('[data-relative-time]').forEach((element) => {
  try {
    const isoDateString = element.dateTime
    const date = new Date(isoDateString)
    const currentTime = new Date()
    const diff = Math.abs((currentTime - date) / 1000)
    if (diff > 60 * 60 * 24) {
      return
    }
    const relativeDate = formatRelativeDate(date, currentTime)
    element.textContent = relativeDate
  } catch (error) {
    console.error(error)
  }
})
