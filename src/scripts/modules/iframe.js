function init() {
  const iframes = document.getElementsByTagName("iframe");

  if (!iframes) {
    return;
  }

  for (const iframe of iframes) {
    for (const attr of iframe.attributes) {
      if (attr.name === 'disallow-page-scroll') {
        iframe.addEventListener('mouseenter', () => {
          document.body.style.overflowY = 'hidden';
        })

        iframe.addEventListener('mouseleave', () => {
          document.body.style.overflowY = '';
        })
      }
    }
  }
}

init();
