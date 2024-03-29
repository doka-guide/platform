import BaseComponent from '../core/base-component.js'
import { setupDb, saveToDb, sendFromDb, closeAndDeleteDb } from './form-cache.js'

class ButtonGroup extends BaseComponent {
  static get EVENTS() {
    return {
      ANSWER: 'answer',
      CORRECTION: 'correction',
    }
  }
  constructor({
    rootElement,
    childsSelector,
    childActiveClass,
    answerCondition = (activeButton) => activeButton.type !== 'button',
  }) {
    super()

    const buttons = rootElement?.querySelectorAll(childsSelector)

    rootElement.addEventListener('click', (event) => {
      const activeButton = event.target.closest(childsSelector)

      if (!activeButton) {
        return
      }

      for (const button of buttons) {
        button.classList.toggle(childActiveClass, button === activeButton)
      }

      const isPositiveAnswer = answerCondition(activeButton)
      const eventType = isPositiveAnswer ? ButtonGroup.EVENTS.ANSWER : ButtonGroup.EVENTS.CORRECTION
      this.emit(eventType, activeButton.value)
    })
  }
}

class DetailedAnswer extends BaseComponent {
  static get EVENTS() {
    return {
      ANSWER: 'answer',
    }
  }

  static get TEXT_THRESHOLD() {
    return 4
  }

  constructor({ rootElement }) {
    super()
    this.textarea = rootElement.querySelector('textarea')
    this.button = rootElement.querySelector('button')

    this.button.addEventListener('click', () => {
      const text = this.textarea.value.trim()
      if (text.length >= DetailedAnswer.TEXT_THRESHOLD) {
        this.emit(DetailedAnswer.EVENTS.ANSWER, text)
      }
    })
    ;['keydown', 'keyup'].forEach((eventType) => {
      this.textarea.addEventListener(eventType, (event) => {
        event.stopPropagation()
      })
    })
  }
}

function init() {
  const form = document.querySelector('.feedback-form')
  const dbFeedbackStoreName = 'feedback'
  const dbFeedbackStoreVersion = 1

  if (!form) {
    return
  }

  const formData = new FormData(form)
  setupDb(dbFeedbackStoreName, dbFeedbackStoreVersion, Object.keys(formData))
  window.addEventListener('online', async () => {
    sendFromDb(dbFeedbackStoreName, saveToServer)
    closeAndDeleteDb(dbFeedbackStoreName)
  })

  const voteDownButton = form.querySelector('.vote--down')
  const voteUpButton = form.querySelector('.vote--up')
  const reasonButton = form.querySelector('.button--another-reason')
  const reasonFieldset = form.querySelector('.feedback-form__fieldset--reason')
  const textControl = form.querySelector('.feedback-form__text')
  const textControlInput = form.querySelector('.text-control__input')

  let isSending = false

  function getToken() {
    return fetch('/api.json')
      .then((resp) => resp.json())
      .then((access) => {
        return access.token
      })
  }

  function saveToServer(formData) {
    const body = JSON.stringify({
      type: 'feedback',
      data: JSON.stringify(formData),
      author_id: 1,
    })
    const url = 'https://api.doka.guide/form'
    return getToken()
      .then((token) => {
        return fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: token,
          },
          body,
        })
      })
      .then((response) => {
        if (!response.ok) {
          throw response
        }

        return response
      })
  }

  function sendForm(formData) {
    if (window.navigator.onLine) {
      return saveToServer(formData)
    } else {
      saveToDb(dbFeedbackStoreName, formData)
      return new Promise((resolve) => {
        resolve(new Response())
      })
    }
  }

  const detailedAnswer = new DetailedAnswer({
    rootElement: textControl,
  })

  detailedAnswer.on(DetailedAnswer.EVENTS.ANSWER, () => {
    setTimeout(() => {
      reasonFieldset.inert = true
      voteUpButton.disabled = true
    })
  })

  const voteButtonGroup = new ButtonGroup({
    rootElement: form.querySelector('.feedback-form__fieldset--vote'),
    childsSelector: '.vote',
    childActiveClass: 'vote--active',
  })

  voteButtonGroup.on(
    ButtonGroup.EVENTS.ANSWER,
    () => {
      setTimeout(() => {
        voteDownButton.disabled = true
        reasonFieldset.inert = true
      })
    },
    { once: true }
  )

  voteButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    voteDownButton.setAttribute('aria-expanded', 'true')
    reasonFieldset.hidden = false
  })

  const reasonsButtonGroup = new ButtonGroup({
    rootElement: reasonFieldset,
    childsSelector: '.feedback-form__reason-button',
    childActiveClass: 'button--active',
  })

  reasonsButtonGroup.on(
    ButtonGroup.EVENTS.ANSWER,
    () => {
      setTimeout(() => {
        reasonFieldset.inert = true
        voteUpButton.disabled = true
        textControl.hidden = true
      })
    },
    { once: true }
  )

  reasonsButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    textControl.hidden = false
    reasonButton.setAttribute('aria-expanded', 'true')
    textControlInput.required = true
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const answer = formData.get('answer') || event.submitter?.value

    if (!(answer && answer.length >= DetailedAnswer.TEXT_THRESHOLD)) {
      return
    }

    isSending = true

    sendForm({
      answer,
      article_id: window.location.pathname,
    })
      .then(() => {
        form.dataset.state = 'success'
        form.setAttribute('aria-describedby', 'success')
      })
      .catch((error) => {
        form.dataset.state = 'error'
        form.setAttribute('aria-describedby', 'error')
        console.error(error)
      })
      .finally(() => {
        isSending = false
      })
  })
}

try {
  init()
} catch (error) {
  console.error(error)
}
