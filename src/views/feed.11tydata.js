module.exports = {
  permalink: 'feed/index.xml',
  eleventyExcludeFromCollections: true,
  meta: {
    title: 'Новое в Доке',
    subtitle: 'Дока — это документация для разработчиков на понятном языке.',
    language: 'ru',
    url: 'https://doka.guide/',
    author: {
      name: 'Дока Дог',
      email: 'hi@doka.guide',
    },
  },

  eleventyComputed: {
    posts: async function (data) {
      const { collections } = data
      return collections.posts.filter((p) => typeof p === 'object').sort((p1, p2) => p1.date - p2.date)
    },
    updated: async function (data) {
      const { posts } = data
      if (posts[0]) {
        return posts[0]?.date
      } else {
        return new Date().toISOString()
      }
    },
  },
}
