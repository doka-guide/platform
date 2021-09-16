const { baseUrl } = require('../../config/constants')

module.exports = {
  eleventyComputed: {
    hasCategory: function(data) {
      return !!(data.categoryName)
    },

    baseUrl,

    pageUrl: function(data) {
      return data.page.url
    },

    fullPageUrl: function(data) {
      return data.baseUrl + data.pageUrl
    }
  },

}
