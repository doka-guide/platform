const { titleFormatter } = require('../libs/title-formatter/title-formatter')

module.exports = {
  title: 'Все статьи',
  layout: 'base.njk',
  permalink: '/all/',

  eleventyComputed: {
    documentTitle: function(data) {
      return titleFormatter([data.title, 'Дока'])
    }
  }
}
