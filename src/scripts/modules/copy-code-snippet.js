function init() {
  const isArticle = !!document.querySelector('.article__content-inner')

  if (!isArticle) {
    return
  }

  const STATES = {
    IDLE: 'idle',
    SUCCESS: 'success',
    ERROR: 'error',
  }

  const MESSAGE_TIMEOUT = 5000

  document.addEventListener('click', (event) => {
    const copyButton = event.target.closest('.block-code__copy-button')

    if (!copyButton) {
      return
    }

    const rootElement = copyButton.closest('.block-code')

    if (!rootElement) {
      return
    }

    const contentElement = rootElement.querySelector('.block-code__highlight')

    if (!contentElement) {
      return
    }

    copyButton.disabled = true

    navigator.clipboard
      .writeText(contentElement.textContent)
      .then(() => {
        copyButton.dataset.state = STATES.SUCCESS
      })
      .catch(() => {
        copyButton.dataset.state = STATES.ERROR
      })
      .finally(() => {
        setTimeout(() => {
          copyButton.dataset.state = STATES.IDLE
          copyButton.disabled = false
        }, MESSAGE_TIMEOUT)
      })
  })
}

init()
