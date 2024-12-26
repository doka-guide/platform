import throttle from '../libs/throttle.js'

window.onload = function () {
  class SnowfallWorker {
    constructor(canvas) {
      // Передаем контроль над канвасом в воркер, чтобы отрисовка не блокировала основной поток
      const offscreenCanvas = canvas.transferControlToOffscreen()
      this.worker = new Worker('/scripts/workers/snow-worker-25.js') // Файл генерируется в gulpfile, не импортом
      this.worker.postMessage({ type: 'canvas', canvas: offscreenCanvas }, [offscreenCanvas])
    }

    createResizeObserver() {
      this.resizer = throttle(() => {
        this.resize()
      }, 33)
    }

    start() {
      this.resize() // У воркера нет информацию о размере окна, поэтому мы должны обновить его вручную перед началом
      if (!this.resizer) {
        this.resizer = this.createResizeObserver()
      }
      window.addEventListener('resize', this.resizer)
      this.worker.postMessage({ type: 'start' })
    }

    stop() {
      this.worker.postMessage({ type: 'stop' })
      window.removeEventListener('resize', this.resizer)
      this.resizer?.cancel()
      this.resizer = null
    }

    resize() {
      const { innerWidth, innerHeight } = window
      this.worker.postMessage({ type: 'resize', window: { innerWidth, innerHeight } })
    }
  }

  function changeSnowAnimation(animationName) {
    if (animationName === 'none') {
      snowfall.stop()
      document.title = pageTitle
    } else if (animationName === 'snowfall') {
      snowfall.start()
      document.title = '❄️ ' + pageTitle
    }
  }

  const canvas = document.getElementById('snowCanvas')
  const snowToggle = document.querySelector('.snow-toggle')
  const snowfall = new SnowfallWorker(canvas)
  const pageTitle = document.title
  const storageKey = 'snow'

  let currentStorage = localStorage.getItem(storageKey)

  if (currentStorage) {
    snowToggle.querySelector(`.snow-toggle__control[value='${currentStorage}']`).checked = true

    changeSnowAnimation(currentStorage)
  } else {
    snowToggle.querySelector(`.snow-toggle__control[value='snowfall']`).checked = true
    changeSnowAnimation('snowfall')
  }

  window.addEventListener('storage', () => {
    changeSnowAnimation(localStorage.getItem(storageKey))
  })

  document.querySelectorAll('input[name="snow"]').forEach((radio) => {
    radio.addEventListener('change', (event) => {
      const value = event.target.value
      localStorage.setItem(storageKey, event.target.value)
      changeSnowAnimation(value)
    })
  })
}
