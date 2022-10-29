// Правит пути к демкам и картинкам, которые вставлены в раздел «На практике».
// Чтобы сослаться на демку из раздела «На практике» используется относительный путь '../demos/index.html'.
// При сборке сайта, раздел вклеивается в основную статью и относительная ссылка ломается.
// Эта трансформация заменяет '../demos/index.html' на './demos/index.html'
/**
 * @param {Window} window
 */
module.exports = function (window) {
  const questionsSection = window.document.getElementById('questions')
  if (questionsSection) {
    const answers = questionsSection.querySelectorAll('.question__answer')
    for (const answer of answers) {
      const path = `/interviews/${answer.id.split('-answers-').join('/answers/')}`
      const mediaElements = answer.querySelectorAll('img, iframe')
      for (const element of mediaElements) {
        const oldLink = element.getAttribute('src')
        const newLink = `${path}/${oldLink}`
        element.setAttribute('src', newLink)
      }
    }
  }
}
