let snowflakes = document.querySelectorAll('.snow__flake')
let snowBtn = document.querySelectorAll('.snow-btn__control')

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min
}

snowflakes.forEach(s => {
  s.style.fontSize = getRndInteger(0.7, 1.5) + 'em'
  s.style.animationDuration = getRndInteger(20, 30) + 's'
  s.style.animationDelay = getRndInteger(-1, snowflakes.length / 2) + 's'
})

snowBtn.forEach(btn => btn.addEventListener('change', function(event) {
  if (event.target?.value === 'yes') {
    snowflakes.forEach(s => s.style.animationName = 'snowfall')
  } else {
    snowflakes.forEach(s => s.style.animationName = 'none')
  }
}) )
