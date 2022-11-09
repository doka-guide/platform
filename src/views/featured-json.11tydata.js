module.exports = {
  permalink: '/featured.json',

  eleventyComputed: {
    json: function (data) {
      const { featuredArticles } = data
      return featuredArticles ?? []
    },
  },
}
