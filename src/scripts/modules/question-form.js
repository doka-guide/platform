import BaseComponent from '../core/base-component.js'

class ButtonGroup extends BaseComponent {
  static get EVENTS() {
    return {
      QUESTION: 'question',
      CORRECTION: 'correction',
    }
  }
  constructor({
    rootElement,
    childsSelector,
    childActiveClass,
    questionCondition = (activeButton) => activeButton.type !== 'button',
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

      const isPositiveQuestion = questionCondition(activeButton)
      const eventType = isPositiveQuestion ? ButtonGroup.EVENTS.QUESTION : ButtonGroup.EVENTS.CORRECTION
      this.emit(eventType, activeButton.value)
    })
  }
}

class DetailedQuestion extends BaseComponent {
  static get EVENTS() {
    return {
      QUESTION: 'question',
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
      if (text.length >= DetailedQuestion.TEXT_THRESHOLD) {
        this.emit(DetailedQuestion.EVENTS.QUESTION, text)
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
  const form = document.querySelector('.question-form')

  if (!form) {
    return
  }

  const questionFieldset = form.querySelector('.question-form__fieldset')
  const textControl = form.querySelector('.question-form__text')

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
      type: 'question',
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

  const detailedQuestion = new DetailedQuestion({
    rootElement: textControl,
  })

  detailedQuestion.on(DetailedQuestion.EVENTS.QUESTION, () => {
    setTimeout(() => {
      questionFieldset.disabled = true
    })
  })

  const questionsButtonGroup = new ButtonGroup({
    rootElement: questionFieldset,
    childsSelector: '.question-form__question-button',
    childActiveClass: 'button--active',
  })

  questionsButtonGroup.on(
    ButtonGroup.EVENTS.QUESTION,
    () => {
      setTimeout(() => {
        questionFieldset.disabled = true
        textControl.hidden = true
      })
    },
    { once: true }
  )

  questionsButtonGroup.on(ButtonGroup.EVENTS.CORRECTION, () => {
    textControl.hidden = false
    detailedQuestion.focus()
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = new FormData(form)
    const question = formData.get('question') || event.submitter?.value
    const person = formData.get('person')

    if (!(question && question.length >= DetailedQuestion.TEXT_THRESHOLD)) {
      return
    }

    isSending = true

    sendForm({
      question,
      person,
      date: new Date().toUTCString(),
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
