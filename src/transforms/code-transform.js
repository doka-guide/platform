// const Prism = require('prismjs')
// const prismLoadLanguages = require('prismjs/components/')

// расстановка классов и атрибутов для элементов кода внутри тела статьи,
// подсветка синтаксиса,
// расстановка номеров строк
/**
 * @param {Window} DOM
 */
module.exports = function(DOM) {
  DOM.document.querySelector('.article__content')
    ?.querySelectorAll('pre > code[class*="language-"]')
    ?.forEach(codeBlock => {
      // const lang = codeBlock.getAttribute('class')
      //   .split(' ')
      //   .map(cls => cls.trim())
      //   .find(cls => cls.includes('language-'))
      //   ?.split('-')[1] || 'unknown'

      // prismLoadLanguages([lang])

      // const lines = Prism.highlight(codeBlock.textContent, Prism.languages[lang], lang)
      //   .split(os.EOL)
      //   .filter((line, index, linesArray) => (index === 0 || index === linesArray.length -1) && line.trim() === '' ? false : true)
      //   .map((line) => `
      //     <span class="code-block__line"><span class="code-block__line-number"></span>
      //   <span class="code-block__line-content">${line}</span></span>
      //   `)

      codeBlock.parentNode.classList.add('code-block font-theme font-theme--code')
      codeBlock.parentNode.setAttribute('tabindex', 0)
      codeBlock.classList.add('code-block__content')
    })
}
