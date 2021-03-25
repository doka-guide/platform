const body = document.querySelector("body")
const aside = document.querySelector("aside")
const asidePage = document.querySelector(".aside-page");

function asideMoving() {
  const arrow = aside.querySelector(".aside__arrow-btn")
  arrow.addEventListener("click", toggleAside)
}

function toggleAside() {
  aside.classList.toggle("aside_hidden")
  asidePage.classList.toggle("aside-page_hidden-aside")
}

function asideOpener() {
  let postPath = window.location.pathname.split("/").filter((el) => el)
  let [postSection, postType, postName] = postPath
  const pageLink = `/${postSection}/${postType}/${postName}`

  // TODO: оптимизировать
  aside.querySelector(`.aside__${postSection}`).open = "true"
  aside.querySelector(`.aside__${postSection}-${postType}`).open = "true"
  aside.querySelector(`[href="${pageLink}"]`).classList.add("_active")
  aside
    .querySelector(`[href*="${postName}"]._active`)
    .parentElement.scrollIntoView()
}

function asideClickHelper(target) {
  if (target.parentElement.classList.contains("aside__item")) {
    aside.querySelectorAll(".aside__item").forEach((el) => {
      if (el !== target.parentElement) {
        el.removeAttribute("open")
      }
      el.querySelectorAll("details").forEach((el) => el.removeAttribute("open"))
    })
  }
}

if (body.contains(aside)) {
  asideMoving()
  aside
    .querySelector(".aside__navigation")
    .addEventListener("click", (event) => asideClickHelper(event.target))
  asideOpener()
}
