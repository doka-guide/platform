function init() {
  const form = document.querySelector('.feedback-form')

  if (!form) {
    return
  }

  const reasonFieldset = form.querySelector('.feedback-form__fieldset--reason')
  const textControl = form.querySelector('.feedback-form__text')

  let isSending = false
  let isLike;

  // есть ли в форме нужные данные
  function isFilledForm() {
    return isLike ||
      (form['reason'].value !== 'other' || form['comment'].value.trim() !== '')
  }

  function sendForm() {
    if (isSending) {
      return
    }

    isSending = true

    return fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: (new URLSearchParams(new FormData(form))).toString()
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

        const label = form.querySelector(isLike ? '.vote__label--down' : '.vote__label--up')
        if (label) {
          label.classList.add('vote__label--disabled')
          label.querySelector('input').disabled = true
        }
        form.querySelector('.feedback-form__fieldset--reason').disabled = true
      })
  }

  form.addEventListener('change', event => {
    const { name, value } = event.target

    switch (true) {
      case (name === 'is-useful' && value === '0'): {
        isLike = false
        reasonFieldset.hidden = false
        break;
      }

      case (name === 'is-useful' && value === '1'): {
        isLike = true
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
