document.querySelectorAll('.persons-list').forEach((list) => {
  const items = list.querySelectorAll('.persons-list__item[hidden]')
  const button = list.querySelector('.persons-list__button')
  const extraPart = list.querySelector('.persons-list__extra')

  button?.addEventListener('click', () => {
    items.forEach((item) => {
      item.hidden = false
    })
    if (extraPart) {
      extraPart.hidden = true
    }
  })
})
