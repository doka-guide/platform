export function init() {
  const DAY_DURATION = 86400
  const time = document.querySelector('[data-relative-time]')

  if (!time) {
    return
  }

  function getPassedTime(postTime) {
    return Math.abs((new Date() - postTime) / 1000) // Вычисляет, сколько прошло времени с момента публикации в секундах
  }

  function timeFormatter(passedTime) {
    const converter = [
      ['hour', 3600],
      ['minute', 60],
      ['second', 1],
    ]
    const timeTemplate = new Intl.RelativeTimeFormat('ru', {
      localeMatcher: 'best fit',
      numeric: 'always',
      style: 'long',
    })
    const [unit, seconds] = converter.find(([, seconds]) => seconds <= passedTime)
    const convertedTime = Math.round(passedTime / seconds)

    return timeTemplate.format(-convertedTime, unit)
  }

  const postTime = new Date(time.dateTime)
  const passedTime = getPassedTime(postTime)

  if (passedTime < DAY_DURATION) {
    time.textContent = timeFormatter(passedTime) // Преобразует прошедшее время с момента публикации в секундах в языковую запись
  }
}

try {
  init()
} catch (error) {
  console.error(`Не удалось вычислить, сколько прошло времени с момента публикации: ${error}`)
}
