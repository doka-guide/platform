import BaseComponent from '../core/base-component.js'

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
    answerCondition = (activeButton) => activeButton.type !== 'button'
  }) {
    super()

    const buttons = rootElement?.querySelectorAll(childsSelector)

    rootElement.addEventListener('click', event => {
      const activeButton = event.target.closest(childsSelector)

      if (!activeButton) {
        return
      }

      event.preventDefault()

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
      ANSWER: 'answer'
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
  }

  focus() {
    this.textarea.focus()
  }
}

function init() {
  const form = document.querySelector('.feedback-form')

  if (!form) {
    return
  }

  const voteDownButton = form.querySelector('.vote--down')
  const voteUpButton = form.querySelector('.vote--up')
  const reasonFieldset = form.querySelector('.feedback-form__fieldset--reason')
  const textControl = form.querySelector('.feedback-form__text')

  let isSending = false

  function sendForm(answer) {
    if (isSending) {
      return
    }

    isSending = true

    const formData = new FormData(form)
    formData.set('answer', answer)
    const body = (new URLSearchParams(formData)).toString()

    return fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    })
      .then(response => {
        if (!response.ok) {
          throw response
        }

        return response
      })
      .then(() => {
        form.dataset.state = 'success'
      })
      .catch(error => {
        form.dataset.state = 'error'
        console.error(error)
      })
      .finally(() => {
        isSending = false
      })
  }

  const detailedAnswer = new DetailedAnswer({
    rootElement: textControl
  })

  detailedAnswer.on(DetailedAnswer.EVENTS.ANSWER, (event) => {
    reasonFieldset.disabled = true
    voteUpButton.disabled = true
    sendForm(event?.detail)
  })

  const voteButtonGroup = new ButtonGroup({
    rootElement: form.querySelector('.feedback-form__fieldset--vote'),
    childsSelector: '.vote',
    childActiveClass: 'vote--active',
  })

  voteButtonGroup.on(ButtonGroup.EVENTS.ANSWER, (event) => {
    voteDownButton.disabled = true
    reasonFieldset.disabled = true
    sendForm(event?.detail)
  }, { once: true })

  voteButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    reasonFieldset.hidden = false
  })

  const reasonsButtonGroup = new ButtonGroup({
    rootElement: reasonFieldset,
    childsSelector: '.feedback-form__reason-button',
    childActiveClass: 'button--active',
  })

  reasonsButtonGroup.on(ButtonGroup.EVENTS.ANSWER, (event) => {
    reasonFieldset.disabled = true
    voteUpButton.disabled = true
    textControl.hidden = true
    sendForm(event?.detail)
  }, { once: true })

  reasonsButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    textControl.hidden = false
    detailedAnswer.focus()
  })

  form.addEventListener('submit', event => {
    event.preventDefault()
  })
}

try {
  init()
} catch (error) {
  console.error(error)
}
