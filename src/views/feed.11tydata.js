// Читалки хранят у себя всё, что когда-либо получили, поэтому отдавать весь
// CHANGELOG целиком незачем: это 450+ записей и сотня килобайт на каждый опрос.
const POSTS_IN_FEED = 50

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
    posts: function (data) {
      const { collections } = data
      // Копия, потому что sort меняет массив на месте, а коллекция общая.
      return [...collections.posts]
        .sort((post1, post2) => new Date(post2.date) - new Date(post1.date))
        .slice(0, POSTS_IN_FEED)
    },
    updated: function (data) {
      const { posts } = data
      return posts[0]?.date ?? new Date().toISOString()
    },
  },
}
