import BaseComponent from '../core/base-component.js'

class Popup extends BaseComponent {
  static get EVENTS() {
    return {
      CLOSE: 'close',
      OPEN: 'open',
    }
  }

  static get LOCAL_STORAGE_KEY() {
    return 'subscription-form-status'
  }

  static get STATUS_STATE() {
    const statusStates = {
      closed: 'CLOSED',
      error: 'ERROR',
      loaded: 'LOADED',
      pending: 'PENDING',
      shown: 'SHOWN',
      success: 'SUCCESS',
    }
    return statusStates
  }

  static get ERROR_CLASS() {
    return 'error'
  }

  static get SUCCESS_CLASS() {
    return 'success'
  }

  constructor({ rootElement, containerSelector, successTextSelector, errorTextSelector, emailTextSelector }) {
    super()
    this.popup = rootElement.parentElement

    this.container = rootElement.parentElement.querySelector(containerSelector)
    this.successText = rootElement.parentElement.querySelector(successTextSelector)
    this.errorText = rootElement.parentElement.querySelector(errorTextSelector)
    this.email = rootElement.parentElement.querySelector(emailTextSelector)

    this.popup.addEventListener('close', () => {
      this.emit(Popup.EVENTS.CLOSE)
      this.close()
    })

    this.popup.addEventListener('open', () => {
      this.emit(Popup.EVENTS.OPEN)
    })
  }

  get status() {
    const formStatus = localStorage.getItem(Popup.LOCAL_STORAGE_KEY)
    if (!formStatus) {
      localStorage.setItem(Popup.LOCAL_STORAGE_KEY, Popup.STATUS_STATE['loaded'])
      return Popup.STATUS_STATE['loaded']
    }
    return formStatus
  }

  set status(newStatus) {
    if (Object.values(Popup.STATUS_STATE).includes(newStatus)) {
      localStorage.setItem(Popup.LOCAL_STORAGE_KEY, newStatus)
    }
  }

  close() {
    this.status = Popup.STATUS_STATE['closed']
    this.popup.close()
  }

  show() {
    this.status = Popup.STATUS_STATE['shown']
    this.popup.show()
    clearInterval(this.timer)
  }

  error(email) {
    this.status = Popup.STATUS_STATE['error']
    this.successText.classList.toggle(Popup.ERROR_CLASS)
    this.container.classList.toggle(Popup.ERROR_CLASS)
    this.email.innerText = email
  }

  success(email) {
    this.status = Popup.STATUS_STATE['success']
    this.successText.classList.toggle(Popup.SUCCESS_CLASS)
    this.container.classList.toggle(Popup.SUCCESS_CLASS)
    this.email.innerText = email
  }

  triggerCallback() {
    if (this.status === Popup.STATUS_STATE['pending']) {
      this.show()
    }
  }

  triggerListenerStart(interval = 20000) {
    if (!this.timer) {
      this.timer = setInterval(() => this.triggerCallback(), interval)
    }
  }
}

class Subscription extends BaseComponent {
  static get EVENTS() {
    return {
      EMAIL: 'email',
    }
  }

  static get VALIDATION_REGEXP() {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  }

  constructor({ rootElement }) {
    super()
    this.container = rootElement.parentElement
    this.input = rootElement.querySelector('input')
    this.button = rootElement.querySelector('button')

    this.button.addEventListener('click', () => {
      const text = this.input.value.trim()
      if (Subscription.VALIDATION_REGEXP.test(text)) {
        this.emit(Subscription.EVENTS.EMAIL, text)
      }
    })
    ;['keydown', 'keyup'].forEach((eventType) => {
      this.input.addEventListener(eventType, (event) => {
        event.stopPropagation()
      })
    })
  }

  focus() {
    this.input.focus()
  }
}

function init() {
  const form = document.querySelector('.subscribe-popup')

  if (!form) {
    return
  }

  const subscriptionForm = form.querySelector('.subscribe-popup__email-form')
  const popupForm = form.querySelector('.subscribe-popup__close-form')

  let isSending = false

  function getToken() {
    return fetch('/api.json')
      .then((resp) => resp.json())
      .then((access) => {
        return access.token
      })
  }

  function sendForm(email, formData) {
    const body = JSON.stringify({
      email,
      data: JSON.stringify(formData),
      author_id: 1,
    })
    const url = 'https://api.doka.guide/subscription'

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

  const popup = new Popup({
    rootElement: popupForm,
    containerSelector: '.subscribe-popup__container',
    successTextSelector: '.subscribe-popup__success-text',
    errorTextSelector: '.subscribe-popup__error-text',
    emailTextSelector: '.subscribe-popup__email',
  })

  const subscription = new Subscription({
    rootElement: subscriptionForm,
  })

  subscription.on(Subscription.EVENTS.EMAIL, () => {
    setTimeout(() => {})
  })

  popup.on(Popup.EVENTS.OPEN, () => {
    setTimeout(() => {
      subscription.focus()
    })
  })

  popup.on(Popup.EVENTS.CLOSE, () => {
    setTimeout(() => {})
  })

  popup.triggerListenerStart()

  form.addEventListener('submit', (event) => {
    if (Object.is(event.target, popupForm)) {
      return
    }

    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = new FormData(subscriptionForm)
    const email = formData.get('email') || event.submitter?.value

    if (!(email && Subscription.VALIDATION_REGEXP.test(email))) {
      return
    }

    isSending = true

    sendForm(email, {
      active: false,
    })
      .then(() => {
        popup.success(email)
      })
      .catch((error) => {
        console.error(error)
        popup.error(email)
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
