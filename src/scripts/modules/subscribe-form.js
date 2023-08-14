import BaseComponent from '../core/base-component.js'

class Settings extends BaseComponent {
  static get EVENTS() {
    return {
      SETTINGS: 'settings',
    }
  }

  constructor({
    rootElement,
    title,
    activeFieldSelector,
    emailFieldSelector,
    whoFieldSelector,
    gradeFieldSelector,
    interestFieldSelector,
    inflation,
    hash,
  }) {
    super()

    this.title = document.querySelector(title)
    this.button = rootElement.querySelector('button')
    this.active = rootElement.querySelector(activeFieldSelector)
    this.email = rootElement.querySelector(emailFieldSelector)
    this.who = rootElement.querySelectorAll(whoFieldSelector)
    this.grade = rootElement.querySelectorAll(gradeFieldSelector)
    this.interests = rootElement.querySelectorAll(interestFieldSelector)
    this.status = rootElement

    if (
      this.title ||
      this.button ||
      this.active ||
      this.email ||
      this.who ||
      this.grade ||
      this.interests ||
      this.status
    ) {
      return
    }

    if (hash && hash !== '') {
      const data = JSON.parse(inflation.profile.data)
      this.email.value = inflation.profile.email
      this.email.parentElement.classList.add('subscribe-settings__row--hidden')
      this.active.value = data.active
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
      if (data.grade) {
        this.grade.forEach((w) => {
          if (data.grade === w.value) {
            w.checked = true
          } else {
            w.checked = false
          }
        })
      }
      if (data.interest) {
        this.interests.forEach((i) => {
          i.checked = !!data.interest.includes(i.value)
        })
      }
    }
  }

  clearStatus() {
    this.status.classList.remove('progress')
    this.status.classList.remove('success')
    this.status.classList.remove('error')
  }

  progress() {
    this.clearStatus()
    this.status.classList.toggle('progress')
    this.status.setAttribute('aria-describedby', 'subscribe-progress')
  }

  success() {
    this.clearStatus()
    this.status.classList.toggle('success')
    this.status.setAttribute('aria-describedby', 'subscribe-success')
  }

  error() {
    this.clearStatus()
    this.status.classList.toggle('error')
    this.status.setAttribute('aria-describedby', 'subscribe-error')
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
    this.status = rootElement

    if (this.input || this.button || this.section || this.status) {
      return
    }

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

  clearStatus() {
    this.status.classList.remove('progress')
    this.status.classList.remove('success')
    this.status.classList.remove('error')
  }

  progress() {
    this.clearStatus()
    this.status.classList.toggle('progress')
    this.status.setAttribute('aria-describedby', 'usubscribe-progress')
  }

  success() {
    this.clearStatus()
    this.status.classList.toggle('success')
    this.status.setAttribute('aria-describedby', 'usubscribe-success')
  }

  error() {
    this.clearStatus()
    this.status.classList.toggle('error')
    this.status.setAttribute('aria-describedby', 'usubscribe-error')
  }
}

async function init() {
  const baseUrl = 'https://api.doka.guide'
  const params = window.location.search.replace('?', '').split('&')
  const hash = params.length > 0 ? params.filter((p) => p.startsWith('hash='))[0]?.replace('hash=', '') : null
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

  const inflation = hash ? await inflateForm(hash) : null

  const settings = new Settings({
    rootElement: settingsForm,
    title: '.subscribe-page .standalone-page__title',
    activeFieldSelector: 'input[name=active]',
    emailFieldSelector: 'input[name=email]',
    whoFieldSelector: 'input[name=who]',
    gradeFieldSelector: 'input[name=grade]',
    interestFieldSelector: 'input[name=interest]',
    inflation: inflation,
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

    formData.active = true

    isSending = true
    settings.progress()

    sendForm(email, formData, hash ? 'PUT' : 'POST', hash ? inflation.profile.id : '')
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
    statusSelector: '.unsubscribe__form.form-with-status',
    isHidden: !!formData.unsubscribed || !formData.active,
  })

  unsubscribeForm.addEventListener('submit', (event) => {
    event.preventDefault()

    if (isSending) {
      return
    }

    const formData = prepareFormData(settingsForm)

    const unsubscribeFormData = prepareFormData(unsubscribeForm)
    const updatedFormData = { ...formData, ...unsubscribeFormData }
    updatedFormData.active = false

    isSending = true
    unsubscribe.progress()

    sendForm(updatedFormData.email, updatedFormData, 'PUT', inflation.profile.id)
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
