function setTabIndex(list, newValue) {
  for (let item of list) {
    item.setAttribute('tabindex', newValue)
  }
}

function toggleTabIndex(container, newValue) {
  setTabIndex(container.getElementsByClassName('block-code__inner'), newValue)
  setTabIndex(container.getElementsByClassName('block-code__copy-button'), newValue)
  setTabIndex(container.getElementsByTagName('a'), newValue)
  setTabIndex(container.getElementsByTagName('input'), newValue)
  for (let iframe of container.getElementsByTagName('iframe')) {
    console.log(iframe.contentWindow.document)
    setTabIndex(iframe.contentWindow.document.getElementsByTagName('a'), newValue)
    setTabIndex(iframe.contentWindow.document.getElementsByTagName('input'), newValue)
  }
}

function togglePractice(event) {
  const element = event.target
  element.toggleAttribute('aria-pressed')
  const isPressed = element.getAttribute('aria-pressed') === ''
  const summaryContainer = element.parentNode
  const contentContainer = summaryContainer.parentNode
  contentContainer.classList.toggle('practices__content--open')
  if (isPressed) {
    element.innerHTML = '+ Развернуть'
    toggleTabIndex(summaryContainer, '-1')
    window.scrollTo(0, contentContainer.offsetTop - 150)
  } else {
    element.innerHTML = '– Свернуть'
    toggleTabIndex(summaryContainer, '0')
  }
}

window.addEventListener('load', () => {
  const practiceTogglerButtons = document.getElementsByClassName('practices__toggler')
  for (let item of practiceTogglerButtons) {
    item.onclick = togglePractice
    toggleTabIndex(item.parentNode, '-1')
  }
  const anchor = document.URL.split('#')[1]
  if (anchor) {
    const header = document.getElementById(anchor)
    const summary = header.parentNode
    if (summary.classList.contains('practices__summary')) {
      const toggler = summary.getElementsByClassName('practices__toggler')[0]
      toggler.setAttribute('aria-pressed', true)
      const contentContainer = summary.parentNode
      contentContainer.classList.toggle('practices__content--open')
      toggler.innerHTML = '+ Свернуть'
      toggleTabIndex(summary, '0')
      window.scrollTo(0, contentContainer.offsetTop + header.offsetTop - 150)
    }
  }
})
