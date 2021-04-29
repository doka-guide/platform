const optionalFeedbackCells = document.querySelectorAll(
  ".js-feedback-optional-cell"
)
const textArea = document.querySelector(".js-feedback-textarea")
const submitButton = document.querySelector(".js-feedback-submit-button")

const form = document.querySelector("form.js-feedback-form")
form &&
  form.addEventListener("submit", function (event) {
    event.preventDefault()
    const formData = new FormData(this)
    if (formData.get("isUseful") === null) {
      return
    }

    submitButton.disabled = true
    submitButton.textContent = "Отправляю..."

    // Netlify Form API	supports only `application/x-www-form-urlencoded` content type
    // So we need to encode fields and values to query string
    const urlEncodedData = new URLSearchParams(formData).toString()
    fetch(window.location.href, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: urlEncodedData,
    })
      .then((res) => {
        const isSuccess = res.status >= 200 && res.status < 300
        showMessage(isSuccess ? "success" : "error")
      })
      .catch((e) => {
        showMessage("error")
      })
  })

const usefulContentRadioButton = document.getElementById("feedack-useful")
usefulContentRadioButton &&
  usefulContentRadioButton.addEventListener("change", () => {
    optionalFeedbackCells.forEach((cell) => {
      cell.classList.replace(
        "feedback-form__cell",
        "feedback-form__cell_hidden"
      )
      textArea.blur()
    })
  })

const notUsefulContentRadioButton = document.getElementById(
  "feedack-not-useful"
)
notUsefulContentRadioButton &&
  notUsefulContentRadioButton.addEventListener("change", () => {
    optionalFeedbackCells.forEach((cell) => {
      cell.classList.replace(
        "feedback-form__cell_hidden",
        "feedback-form__cell"
      )
      textArea.focus()
    })
  })

optionalFeedbackCells &&
  optionalFeedbackCells.forEach((cell) => {
    cell.addEventListener("transitionend", () => {
      if (cell.classList.contains("feedback-form__cell")) {
        window.scrollTo({
          top: submitButton.offsetTop,
          left: 0,
          behavior: "smooth",
        })
      }
    })
  })

function showMessage(type) {
  if (typeof type === "string") {
    const message = document.querySelector(`.feedback__${type}-message_hidden`)

    if (message) {
      form.classList.replace("feedback-form", "feedback-form_hidden")
      message.classList.replace(
        `feedback__${type}-message_hidden`,
        `feedback__${type}-message`
      )
    }
  }
}

if (document.location.host.contains('localhost')){
  const localhostMessage = document.querySelector('.feedback__localhost-message_hidden');

  form.classList.add('feedback-form_hidden');
  localhostMessage.classList.remove('feedback__localhost-message_hidden')
}
