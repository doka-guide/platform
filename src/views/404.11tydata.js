const { titleFormatter } = require('../libs/title-formatter/title-formatter')

module.exports = {
  title: 'Страница не найдена',
  layout: 'base.njk',
  permalink: '/404/index.html',
  eleventyComputed: {
    documentTitle: function(data) {
      return titleFormatter([data.title, 'Дока'])
    }
  }
}
