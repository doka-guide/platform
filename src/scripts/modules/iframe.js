function init() {
  const iframes = document.getElementsByTagName('iframe')

  if (!iframes) {
    return;
  }

  for (const iframe of iframes) {
    for (const attr of iframe.attributes) {
      if (attr.name === 'data-disallow-page-scroll') {
        iframe.addEventListener('mouseenter', () => {
          document.body.classList.add('base__body--disallow-scroll')
        })

        iframe.addEventListener('mouseleave', () => {
          document.body.classList.remove('base__body--disallow-scroll')
        })
      }
    }
  }
}

init()
