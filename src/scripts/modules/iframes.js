const article = document.querySelector('article')
const iframes = article.querySelectorAll('iframe')

window.onload = iframes.forEach(element => {
  let iframeBody = element.contentWindow.document.querySelector('body')
  element.width = article.offsetWidth
  if (iframeBody.offsetHeight) {
    element.height = iframeBody.offsetHeight
  }
});
