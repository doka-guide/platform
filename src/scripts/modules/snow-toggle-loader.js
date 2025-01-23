const currentDate = new Date()

if (
  (currentDate.getMonth() === 11 && currentDate.getDate() > 25) ||
  (currentDate.getMonth() === 0 && currentDate.getDate() < 15)
) {
  const promisifiedOnloadEvent = new Promise((resolve) => {
    window.onload = resolve
  })

  import('./snow-toggle-25.js').then((module) => {
    promisifiedOnloadEvent.then(() => {
      const toggles = document.getElementsByClassName('theme-toggle snow-toggle')

      for (const toggle of toggles) {
        toggle.classList.remove('visually-hidden')
      }

      module.default()
    })
  })
}
