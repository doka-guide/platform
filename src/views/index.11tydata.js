module.exports = {
  layout: 'base.njk',
  permalink: '/',
  documentTitle: 'Гайд по трудоустройству — Спецпроект — Дока',
  documentDescription:
    'Спецпроект «Гайд по трудоустройству» команды Доки — документации для разработчиков на человеческом языке',
  bodyClass: 'landing__body',
  isMainPage: true,

  eleventyComputed: {
    title: function () {
      return 'Гайд по трудоустройству — Спецпроект — Дока'
    },

    defaultOpenGraphPath: function (data) {
      return data.fullPageUrl + 'images/covers/og-landing.png'
    },

    defaultTwitterPath: function (data) {
      return data.fullPageUrl + 'images/covers/twitter-landing.png'
    },
  },
}
