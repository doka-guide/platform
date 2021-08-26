// Правит пути к демкам и картинкам, которые вставлены в раздел «В работе».
// Чтобы сослаться на демку из раздела «В работе» используется относительный путь '../demos/index.html'.
// При сборке сайта, раздел вклеивается в основную статью и относительная ссылка ломается.
// Эта трансформация заменяет '../demos/index.html' на './demos/index.html'
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  const practicesSection = DOM.document.getElementById('practices')
  if (practicesSection) {
    const mediaElements = practicesSection.querySelectorAll('img, iframe')
    for (const element of mediaElements) {
      const oldLink = element.getAttribute('src');
      const newLink = oldLink.replace('../', './');
      element.setAttribute('src', newLink);
    }
  }
}
