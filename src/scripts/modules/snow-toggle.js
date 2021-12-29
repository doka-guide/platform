const STOR_KEY = 'snow'
const snow = document.querySelector('.snow')
let snowflakes = document.querySelectorAll('.snow__flake')
const snowToggle = document.querySelector('.snow-toggle')

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min
}

function getRndFloat(min, max) {
  return (Math.random() * (max - min) + min).toFixed(1)
}

function snowflakesRandom() {
  snowflakes.forEach(snowflake => {
    snowflake.style.fontSize = getRndFloat(0.7, 1.5) + 'em'
    snowflake.style.animationDuration = getRndInteger(20, 30) + 's'
    snowflake.style.animationDelay = getRndInteger(-1, snowflakes.length / 2) + 's'
  })
}

snowToggle.addEventListener('change', event => {
  snow.style.setProperty('--animationName',  event.target?.value === 'yes' ? 'snowfall' : 'none')
  localStorage.setItem(STOR_KEY, event.target?.value)
})

document.addEventListener('DOMContentLoaded', () => {
  let curStore = localStorage.getItem(STOR_KEY)

  if (curStore) {
    snowToggle.querySelector(`.snow-toggle__control[value='${curStore}']`).checked = true
  } else if (curStore === 'yes' || !curStore) {
    snowflakesRandom()
  }
})
