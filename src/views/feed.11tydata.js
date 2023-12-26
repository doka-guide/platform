module.exports = {
  permalink: 'feed/index.xml',
  eleventyExcludeFromCollections: true,
  meta: {
    title: 'Новое в Доке',
    subtitle:
      'Дока — это документация для разработчиков на понятном языке. Её пишет сообщество, чтобы помогать друг другу. Ваши знания и опыт важны. Делитесь ими, мы поможем.',
    language: 'ru',
    url: 'https://doka.guide/',
    author: {
      name: 'Дока Дог',
      email: 'hi@doka.guide',
    },
  },

  eleventyComputed: {
    summary: function () {
      return 'Test'
    },
  },
}
