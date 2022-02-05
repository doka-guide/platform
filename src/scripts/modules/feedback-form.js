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

  function getToken() {
    return fetch('/api.json')
      .then((resp) => resp.json())
      .then((access) => {
        return access.token
      })
  }

  function sendForm(formData) {
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

  const detailedAnswer = new DetailedAnswer({
    rootElement: textControl,
  })

  detailedAnswer.on(DetailedAnswer.EVENTS.ANSWER, () => {
    setTimeout(() => {
      reasonFieldset.disabled = true
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
        reasonFieldset.disabled = true
      })
    },
    { once: true }
  )

  voteButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
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
        reasonFieldset.disabled = true
        voteUpButton.disabled = true
        textControl.hidden = true
      })
    },
    { once: true }
  )

  reasonsButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    textControl.hidden = false
    detailedAnswer.focus()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = new FormData(form)
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
      })
      .catch((error) => {
        form.dataset.state = 'error'
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
