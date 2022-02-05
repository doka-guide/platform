// Оборачивает содержимое details в блоки с классом `.content`
/**
 * @param {Window} window
 */
module.exports = function (window) {
  window.document
    .querySelector('.article__content-inner')
    ?.querySelectorAll('details')
    ?.forEach((detailsElement) => {
      const summaryElement = detailsElement.removeChild(detailsElement.firstElementChild)
      const detailsContent = detailsElement.innerHTML

      detailsElement.classList.add('details')
      summaryElement.classList.add('details__summary')
      detailsElement.innerHTML = `
        ${summaryElement.outerHTML}
        <div class="details__content content">${detailsContent}</div>
      `
    })
}
