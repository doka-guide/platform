module.exports = {
  title: 'Участники',
  layout: 'base.njk',
  permalink: '/people/',

  eleventyComputed: {
    // Правило скрывает карточки участников, не попадающие в выбранные разделы.
    // Строится из коллекций, поэтому не может лежать в обычном CSS-файле.
    // Раньше отдавалось тегом <style> прямо в разметке страницы, но по
    // спецификации style — метаданные и допустим только в head.
    pageStyles: function (data) {
      const sections = data.collections.articleIndexes || []
      const selector = sections
        .map((section) => `[data-filters*='${section.fileSlug}'] > *:not([data-categories*='${section.fileSlug}'])`)
        .join(', ')
      return selector ? `${selector} { display: none; }` : ''
    },
  },
}
