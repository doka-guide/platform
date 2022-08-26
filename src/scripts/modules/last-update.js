const timeMeasurementsToSeconds = {
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
  let timeMeasurementName

  const rtf = new Intl.RelativeTimeFormat('ru', {
    localeMatcher: 'best fit',
    numeric: 'always',
    style: 'long',
  })

  Object.entries(timeMeasurementsToSeconds).find(([key, value]) => {
    if (timeDiff >= value) {
      timeMeasurementName = key
      return true
    }
  })

  timeDiff = Math.round(timeDiff / timeMeasurementsToSeconds[timeMeasurementName])

  return rtf.format(-timeDiff, timeMeasurementName)
}

document.querySelectorAll('[data-relative-time]').forEach((element) => {
  try {
    const isoDateString = element.dateTime
    const date = new Date(isoDateString)
    const currentTime = new Date()
    const diff = Math.abs(getTimeDiff(date, currentTime))
    if (diff > timeMeasurementsToSeconds['day']) {
      return
    }
    const relativeDate = formatRelativeDate(date, currentTime)
    element.textContent = relativeDate
  } catch (error) {
    console.error(error)
  }
})
