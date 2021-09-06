const os = require('os')
const hljs = require('highlight.js/lib/common')

function renderLine(line) {
  return `<tr class="code-block__line"><th class="code-block__line-number"></th><td class="code-block__line-content">${line}</td></tr>`
}

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  DOM.document.querySelector('.article__content')
    ?.querySelectorAll('pre[data-lang] > code')
    ?.forEach(codeBlock => {
      let language = codeBlock.parentNode.getAttribute('data-lang').trim()

      if (language === 'js') {
        language = 'javascript'
      }

      const content = language
        ? hljs.highlight(codeBlock.textContent, { language }).value
        : codeBlock.textContent

      const lines = content
        .split(os.EOL)
        .filter((line, index, linesArray) => {
          // удаляем первую и последнюю пустые строки
          const isFirtsOrLastLine = (index === 0 || index === linesArray.length -1)
          const isEmptyLine = line.trim() === ''
          return !(isFirtsOrLastLine && isEmptyLine)
        })
        .map((line) => renderLine(line))
        .join(os.EOL)


        const wrapper = DOM.document.createElement('div')
        wrapper.setAttribute('tabindex', 0)
        wrapper.classList.add('code-block', 'font-theme', 'font-theme--code')
        wrapper.innerHTML = `<table class="code-block__content" aria-hidden="true"><tbody>${lines}</tbody></table>`

        codeBlock.parentNode.classList.add('code-block__origin', 'visually-hidden')
        const clonedCodeElement = codeBlock.parentNode;
        wrapper.appendChild(clonedCodeElement)

        codeBlock.parentNode.replaceWith(wrapper)
    })
}
