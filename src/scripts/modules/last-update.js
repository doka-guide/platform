const piecesToSeconds = {
  day: 86400,
  hour: 3600,
  minute: 60,
  second: 1,
}

function getTimeDiff(date, currentTime) {
  return (currentTime - date) / 1000
}

function formatRelativeDate(date, currentTime = new Date()) {
  let timeDiff = getTimeDiff(date, currentTime)

  const rtf = new Intl.RelativeTimeFormat('ru', {
    localeMatcher: 'best fit',
    numeric: 'always',
    style: 'long',
  })

  const [piece, seconds] = Object
    .entries(piecesToSeconds)
    .find(([piece, seconds]) => timeDiff >= seconds)

  timeDiff = Math.round(timeDiff / seconds)

  return rtf.format(-timeDiff, piece)
}

document.querySelectorAll('[data-relative-time]').forEach((element) => {
  try {
    const isoDateString = element.dateTime
    const date = new Date(isoDateString)
    const currentTime = new Date()
    const diff = Math.abs(getTimeDiff(date, currentTime))
    if (diff > piecesToSeconds['day']) {
      return
    }
    const relativeDate = formatRelativeDate(date, currentTime)
    element.textContent = relativeDate
  } catch (error) {
    console.error(error)
  }
})
