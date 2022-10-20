// Настраивает markdown-it
const markdownIt = require('markdown-it')

module.exports = () => {
  const md = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    highlight: function (str, lang) {
      const content = md.utils.escapeHtml(str)
      const LANG_ALIASES = {
        javascript: 'js',
        nginxconf: 'nginx',
      }

      if (lang in LANG_ALIASES) {
        lang = LANG_ALIASES[lang]
      }

      return lang ? `<pre data-lang='${lang}'><code>${content}</code></pre>` : `<pre>${content}</pre>`
    },
  })

  const defaultRenderer = md.renderer.rules.html_block
  md.renderer.rules.html_block = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const blockContent = token.content.trim()
    // отдельно обрабатываем html-блоки с тегом видео
    if (blockContent.startsWith('<video') && !blockContent.endsWith('</video>')) {
      const selectVideoAndCaption = /([\s\S]+<\/video>)([\s\S]+)$/i
      const [, videoHtml, caption] = blockContent.match(selectVideoAndCaption)
      if (videoHtml && caption) {
        return `<figure>
          ${videoHtml.trim()}
          <figcaption>
            ${md.renderInline(caption.trim())}
          </figcaption>
        </figure>`
      }
    }

    return defaultRenderer(tokens, idx, options, env, self)
  }

  return md
}
