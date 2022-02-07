module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.pages',
    size: 1,
    alias: 'pageObject',
  },

  permalink: '{{ (pageObject.data.location or pageObject.fileSlug) | slugify }}/index.html',

  eleventyComputed: {
    title: function (data) {
      const { pageObject } = data
      return pageObject.data.title
    },

    description: function (data) {
      const { pageObject } = data
      return pageObject.data.description
    },
  },
}
