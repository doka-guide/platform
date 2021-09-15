module.exports = {
  eleventyComputed: {
    hasCategory: function(data) {
      return !!(data.categoryName)
    }
  }
}
