let snowflakes = document.querySelectorAll('.snow__flake')
let snowControl = document.querySelectorAll('.snow-toggle__control')

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min
}

snowflakes.forEach(snowflake => {
  snowflake.style.fontSize = getRndInteger(0.7, 1.5) + 'em'
  snowflake.style.animationDuration = getRndInteger(20, 30) + 's'
  snowflake.style.animationDelay = getRndInteger(-1, snowflakes.length / 2) + 's'
})

snowControl.forEach(control => control.addEventListener('change', function(event) {
  if (event.target?.value === 'yes') {
    snowflakes.forEach(snowflake => snowflake.style.animationName = 'snowfall')
  } else {
    snowflakes.forEach(snowflake => snowflake.style.animationName = 'none')
  }
}))
