function setTabIndex(list, newValue) {
  for (let item of list) {
    item.setAttribute('tabindex', newValue)
  }
}

function getActiveElements(container) {
  const allElements = []
  allElements.push(container.getElementsByClassName('block-code__inner'))
  allElements.push(container.getElementsByClassName('block-code__copy-button'))
  allElements.push(container.getElementsByTagName('a'))
  allElements.push(container.getElementsByTagName('input'))
  for (let iframe of container.getElementsByTagName('iframe')) {
    allElements.push(iframe.contentWindow.document.getElementsByTagName('a'))
    allElements.push(iframe.contentWindow.document.getElementsByTagName('input'))
  }
  return allElements
}

function toggleTabIndex(container, newValue) {
  const activeElements = getActiveElements(container)
  activeElements.forEach((elements) => {
    setTabIndex(elements, newValue)
  })
}

function tabKeyPressed(event) {
  const summaryContainer = event.target.parentNode
  const contentContainer = summaryContainer.parentNode
  const activeElements = getActiveElements(contentContainer)
  if (event.shiftKey && event.key === 'Tab') {
    const collectionNumber = activeElements.length - 1
    const elementNumber = activeElements[collectionNumber].length - 1
    activeElements[collectionNumber][elementNumber].focus()
  } else if (event.key === 'Tab') {
    activeElements[0][0].focus()
  }
}

function togglePractice(event) {
  const element = event.target
  element.toggleAttribute('data-collapsed')
  const isPressed = element.getAttribute('data-collapsed') === ''
  const summaryContainer = element.parentNode
  const contentContainer = summaryContainer.parentNode
  contentContainer.classList.toggle('answer__content--open')
  if (isPressed) {
    element.innerHTML = '+ Развернуть'
    element.removeEventListener('keydown', tabKeyPressed)
    toggleTabIndex(summaryContainer, '-1')
    window.scrollTo(0, contentContainer.offsetTop - 150)
  } else {
    element.innerHTML = '– Свернуть'
    element.addEventListener('keydown', tabKeyPressed)
    toggleTabIndex(summaryContainer, '0')
  }
}

window.addEventListener('load', () => {
  const practiceTogglerButtons = document.getElementsByClassName('answer__toggler')
  for (let item of practiceTogglerButtons) {
    item.onclick = togglePractice
    toggleTabIndex(item.parentNode, '-1')
  }
  const anchor = document.URL.split('#')[1]
  if (anchor) {
    const header = document.getElementById(anchor)
    const summary = header.parentNode
    if (summary.classList.contains('answer__summary')) {
      const toggler = summary.getElementsByClassName('answer__toggler')[0]
      toggler.setAttribute('data-collapsed', true)
      const contentContainer = summary.parentNode
      contentContainer.classList.toggle('answer__content--open')
      toggler.innerHTML = '+ Свернуть'
      toggleTabIndex(summary, '0')
      window.scrollTo(0, contentContainer.offsetTop + header.offsetTop - 150)
    }
  }
})
