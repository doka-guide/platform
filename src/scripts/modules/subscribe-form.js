import BaseComponent from '../core/base-component.js'

class Settings extends BaseComponent {
  static get EVENTS() {
    return {
      SETTINGS: 'settings',
    }
  }

  static get VALIDATION_REGEXP() {
    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  }

  constructor({ rootElement, title, emailFieldSelector, whoFieldSelector, interestFieldSelector, inflation, hash }) {
    super()

    this.title = document.querySelector(title)
    this.button = rootElement.querySelector('button')
    this.email = rootElement.querySelector(emailFieldSelector)
    this.hash = rootElement.querySelector('input[name=hash]')
    this.active = rootElement.querySelector('input[name=active]')
    this.id = rootElement.querySelector('input[name=id]')
    this.unsubscribed = rootElement.querySelector('input[name=unsubscribed]')
    this.who = rootElement.querySelectorAll(whoFieldSelector)
    this.interests = rootElement.querySelectorAll(interestFieldSelector)

    this.hash.value = hash
    if (hash && hash !== '') {
      const data = JSON.parse(inflation.profile.data)
      this.email.value = inflation.profile.email
      this.email.parentElement.classList.add('subscribe-settings__row--hidden')
      this.active.value = data.active
      this.id.value = inflation.profile.id
      this.unsubscribed.value = !!data.reason
      if (data.active) {
        this.button.innerHTML = 'Сохранить'
        this.title.innerHTML = 'Настройка рассылки'
      } else if (!data.active && data.reason) {
        this.button.innerHTML = 'Подписаться снова'
        this.title.innerHTML = 'Вы отписаны от рассылки'
      } else if (!data.active) {
        this.button.innerHTML = 'Сохранить'
        this.title.innerHTML = 'Настройте рассылку'
      }
      if (data.who) {
        this.who.forEach((w) => {
          if (data.who === w.value) {
            w.checked = true
          } else {
            w.checked = false
          }
        })
      }
      if (data.interest) {
        this.interests.forEach((i) => {
          if (data.interest.includes(i.value)) {
            i.checked = true
          } else {
            i.checked = false
          }
        })
      }
    }

    this.button.addEventListener('click', () => {
      const text = this.email.value.trim()
      if (Settings.VALIDATION_REGEXP.test(text)) {
        this.emit(Settings.EVENTS.EMAIL, text)
      }
    })
    ;['keydown', 'keyup'].forEach((eventType) => {
      this.email.addEventListener(eventType, (event) => {
        event.stopPropagation()
      })
    })
  }

  success() {
    console.log('Форма отравлена')
  }

  error() {
    console.log('Возникли ошибки')
  }

  focus() {
    if (this.email.value === '') {
      this.email.focus()
    } else {
      this.who.focus()
    }
  }
}

class Unsubscribe extends BaseComponent {
  static get EVENTS() {
    return {
      UNSUBSCRIBE: 'unsubscribe',
    }
  }

  constructor({ rootElement, isHidden }) {
    super()

    this.input = rootElement.querySelector('input')
    this.button = rootElement.querySelector('button')
    this.section = rootElement.parentElement

    if (isHidden) {
      this.section.classList.add('unsubscribe-section--hidden')
    }

    this.button.addEventListener('click', () => {
      const text = this.input.value.trim()
      this.emit(Unsubscribe.EVENTS.UNSUBSCRIBE, text)
    })
    ;['keydown', 'keyup'].forEach((eventType) => {
      this.input.addEventListener(eventType, (event) => {
        event.stopPropagation()
      })
    })
  }

  success() {
    console.log('Форма отравлена')
  }

  error() {
    console.log('Возникли ошибки')
  }

  focus() {
    this.input.focus()
  }
}

async function init() {
  const baseUrl = 'http://localhost:8080'
  const hash = window.location.search
    ? window.location.search
        .replace('?', '')
        .split('&')
        .filter((p) => p.startsWith('hash='))[0]
        .replace('hash=', '')
    : null
  const form = document.querySelector('.subscribe-page')

  if (!form) {
    return
  }

  const settingsForm = form.querySelector('.subscribe-page__subscribe')
  const unsubscribeForm = form.querySelector('.subscribe-page__unsubscribe')

  let isSending = false

  function getToken() {
    return fetch('/api.json')
      .then((resp) => resp.json())
      .then((access) => {
        return access.token
      })
  }

  async function inflateForm(hash) {
    const url = `${baseUrl}/profile-link/${hash}`

    return getToken()
      .then((token) => {
        return fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: token,
          },
        })
      })
      .then((resp) => resp.json())
  }

  function sendForm(email, formData, method, id = '') {
    const body = JSON.stringify({
      email,
      data: JSON.stringify(formData),
      author_id: 1,
    })
    const url = method === 'POST' ? `${baseUrl}/subscription` : `${baseUrl}/subscription/${id}`

    return getToken()
      .then((token) => {
        return fetch(url, {
          method: method,
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

  function prepareFormData(form) {
    const formData = Array.from(new FormData(form)).reduce((result, field) => {
      if (result[field[0]] && typeof result[field[0]] === 'string') {
        const tmp = result[field[0]]
        result[field[0]] = []
        result[field[0]].push(tmp)
        result[field[0]].push(field[1])
        return {
          ...result,
        }
      } else if (result[field[0]] && Array.isArray(result[field[0]])) {
        result[field[0]].push(field[1])
        return {
          ...result,
        }
      } else if (typeof field[1] === 'string' && (field[1] === 'true' || field[1] === 'false')) {
        return {
          ...result,
          [field[0]]: field[1] === 'true' ? true : false,
        }
      }
      return {
        ...result,
        [field[0]]: field[1],
      }
    }, {})
    return formData
  }

  const settings = new Settings({
    rootElement: settingsForm,
    title: '.subscribe-page .standalone-page__title',
    emailFieldSelector: 'input[name=email]',
    whoFieldSelector: 'input[name=who]',
    interestFieldSelector: 'input[name=interest]',
    inflation: hash ? await inflateForm(hash) : null,
    hash: hash,
  })

  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = prepareFormData(settingsForm)

    const email = formData.email
    if (email) {
      delete formData.email
    }
    if (formData.hash) {
      delete formData.hash
    }
    const id = formData.id
    if (id) {
      delete formData.id
    }

    if (formData.active || !formData.active) {
      formData.active = true
    }
    if (typeof formData.unsubscribed !== 'undefined') {
      delete formData.unsubscribed
    }

    isSending = true

    sendForm(email, formData, hash ? 'PUT' : 'POST', id)
      .then(() => {
        settings.success()
      })
      .catch((error) => {
        settings.error()
        console.error(error)
      })
      .finally(() => {
        isSending = false
      })
  })

  const formData = prepareFormData(settingsForm)
  const unsubscribe = new Unsubscribe({
    rootElement: unsubscribeForm,
    isHidden: !!formData.unsubscribed || !formData.active,
  })

  unsubscribeForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = prepareFormData(settingsForm)

    const unsubscribeFormData = Array.from(new FormData(unsubscribeForm)).reduce((result, field) => {
      return {
        ...result,
        [field[0]]: field[1],
      }
    }, {})
    const updatedFormData = { ...formData, ...unsubscribeFormData }
    updatedFormData.active = false
    if (updatedFormData.unsubscribed) {
      delete updatedFormData.unsubscribed
    }

    isSending = true

    sendForm(updatedFormData.email, updatedFormData, 'PUT', updatedFormData.id)
      .then(() => {
        unsubscribe.success()
      })
      .catch((error) => {
        unsubscribe.error()
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
