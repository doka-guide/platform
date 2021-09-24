function init() {
  const form = document.forms['feedback-form']

  if (!form) {
    return
  }

  const reasonFieldset = form.querySelector('.feedback-form__fieldset--reason')
  const textControl = form.querySelector('.feedback-form__text')

  let isSending = false

  // есть ли в форме нужные данные
  function isFilledForm() {
    return form['is-useful'].value !== '0'
      && (form['reason'].value !== 'other' || form['comment'].value.trim() !== '')
  }

  function sendForm() {
    if (isSending) {
      return
    }

    isSending = true

    return fetch('/', {
      method: 'POST',
      body: new URLSearchParams(new FormData(form))
    })
      .then(response => {
        if (!response.ok) {
          throw response
        }

        return response
      })
      .then(() => {
        form.dataset.state = 'success'
        form.elements.forEach(element => {
          if (element.tagName.toLowerCase() === 'fieldset') {
            element.disabled = true
          }
        })
      })
      .catch(error => {
        form.dataset.state = 'error'
        console.error(error)
      })
      .finally(() => {
        isSending = false
      })
  }

  form.addEventListener('change', event => {
    const { name, value } = event.target

    switch (true) {
      case (name === 'is-useful' && value === '0'): {
        reasonFieldset.hidden = false
        break;
      }

      case (name === 'is-useful' && value === '1'): {
        reasonFieldset.hidden = true
        sendForm()
        break;
      }

      case (name === 'reason' && value === 'other'): {
        textControl.hidden = false
        break;
      }

      case (name === 'reason' && value !== 'other'): {
        textControl.hidden = true
        sendForm()
        break;
      }
    }
  })

  form.addEventListener('submit', event => {
    event.preventDefault()

    if (!isFilledForm()) {
      return
    }

    sendForm()
  })
}

try {
  init()
} catch (error) {
  console.error(error)
}
