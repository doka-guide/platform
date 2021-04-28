const body = document.querySelector('body')
const aside = document.querySelector('.aside')

function asideMoving() {
  const arrow = aside.querySelector('.aside__arrow-btn')
  arrow.addEventListener('click', action)
}

function toggleAside() {
  aside.classList.toggle('aside_hidden')
}

function animationAsidePage() {
  const asidePage = document.querySelector('.aside-page')
  const content = document.querySelector('.aside-page__content')

  asidePage.classList.toggle('aside-page_hidden-aside')
  content.classList.toggle('aside-page__content_hidden')
}

function action () {
  toggleAside()
  animationAsidePage()
}

if (body.contains(aside)) {
  asideMoving()
  asideOpener()
}
