const { slugify } = require('transliteration')

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.pages',
    size: 1,
    alias: 'pageObject',
  },

  permalink: "{{ (pageObject.data.location or pageObject.fileSlug) | slug }}/index.html",

  eleventyComputed: {
    title: function(data) {
      const { pageObject } = data
      return pageObject.data.title
    },

    description: function(data) {
      const { pageObject } = data
      return pageObject.data.description
    },

    pageLink: function(data) {
      const { pageObject } = data
      return `/${slugify(pageObject.data.location || pageObject.fileSlug)}/`
    }
  }
}
