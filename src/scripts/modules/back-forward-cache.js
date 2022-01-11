const logElement = document.createElement('pre')
logElement.style.display = 'none'

function log(event) {
  logElement.textContent += `
    ${(new Date().toISOString())} ${event.type} ${event.persisted}
  `
}

document.body.appendChild(logElement)

window.addEventListener('load', log)
window.addEventListener('pageshow', log)
window.addEventListener('pagehide', log)
