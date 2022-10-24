const subscribePopupForm = document.querySelector('.subscribe-popup__container')
const subscribePopupSuccessText = document.querySelector('.subscribe-popup__success-text')
const successClass = 'success'

subscribePopupForm.addEventListener('submit', (event) => {
  event.preventDefault()
  subscribePopupForm.classList.toggle(successClass)
  subscribePopupSuccessText.classList.toggle(successClass)
})
