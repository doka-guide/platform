self.onmessage = function (event) {
  const { type } = event.data
  if (type === 'canvas') {
    self.snowfall?.stop()
    self.snowfall = new Snowfall(event.data.canvas)
  } else if (type === 'resize') {
    self.snowfall.resize(event.data.window)
  } else if (type === 'stop') {
    self.snowfall?.stop()
  } else if (type === 'start') {
    self.snowfall?.start()
  } else if (type === 'clear') {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

class Snowfall {
  constructor(canvas) {
    this.canvas = canvas
    this.context = canvas.getContext('2d')
    this.snowCounter = 0
    this.speedMultiplier = 0
    this.snowflakes = []
    this.animationFrameId = null
  }

  createSnowflake() {
    const radius = getRandomInt(1, 10)
    return {
      xpos: getRandomInt(0, this.canvas.width),
      ypos: getRandomInt(-this.canvas.height, 0),
      radius: radius,
      opacity: radius * 10,
      speed: this.speedMultiplier * (radius / 6),
      dx: (Math.random() - 0.5) * 2,
    }
  }

  drawSnowflake(flake) {
    this.context.beginPath()
    this.context.arc(flake.xpos, flake.ypos, flake.radius, 0, Math.PI * 2)
    this.context.fillStyle = `hsl(202.33deg 53.09% 84.12% / ${flake.opacity}%)`
    this.context.fill()
  }

  updateSnowflake(flake) {
    flake.xpos += flake.dx
    flake.ypos += flake.speed

    if (flake.ypos - flake.radius > this.canvas.height) {
      flake.ypos = getRandomInt(-this.canvas.height, 0)
      flake.xpos = getRandomInt(0, this.canvas.width)
    }
  }

  start() {
    this.snowCounter = 100
    this.speedMultiplier = 1

    this.stop()
    this.snowflakes = Array.from({ length: this.snowCounter }, () => this.createSnowflake())
    this.animate()
  }

  animate() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.snowflakes.forEach((flake) => {
      this.updateSnowflake(flake)
      this.drawSnowflake(flake)
    })
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    this.snowflakes = []
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  setCounter(newCount) {
    this.snowCounter = newCount
    this.snowflakes = Array.from({ length: this.snowCounter }, () => this.createSnowflake())
  }

  resize(window) {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
