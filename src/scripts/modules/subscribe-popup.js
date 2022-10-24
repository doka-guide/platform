const subscribePopupForm = document.querySelector('.subscribe-popup__container')
const subscribePopupSuccessText = document.querySelector('.subscribe-popup__success-text')
const successClass = 'success'
const userEmail = document.querySelector('.subscribe-popup__email')

subscribePopupForm.addEventListener('submit', (event) => {
  event.preventDefault()
  subscribePopupForm.classList.toggle(successClass)
  subscribePopupSuccessText.classList.toggle(successClass)
  userEmail.textContent = subscribePopupForm.querySelector('input').value
})
