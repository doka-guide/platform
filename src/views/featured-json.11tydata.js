module.exports = {
  permalink: '/featured.json',

  eleventyComputed: {
    featuredJson: function (data) {
      const { featuredArticles } = data
      return featuredArticles ?? []
    },
  },
}
