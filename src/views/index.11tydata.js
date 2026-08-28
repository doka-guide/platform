const constants = require('../../config/constants')

const defaultPromo = {
  color: '0 100% 100%',
  content:
    'Дока — это документация для разработчиков на понятном языке. Её пишет сообщество, чтобы помогать друг другу. Ваши знания и опыт важны. Делитесь ими, мы поможем.',
  design: 'default',
  links: [
    {
      emoji: '🙌',
      text: 'Участники',
      url: '/people/',
    },
    {
      emoji:
        '<svg class="intro__icon intro__icon--invertible" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M11 0C4.92265 0 0 5.04649 0 11.2767C0 16.2609 3.15347 20.4836 7.52241 21.9789C8.06937 22.0827 8.27194 21.7366 8.27194 21.432C8.27194 21.162 8.26519 20.4559 8.25844 19.5145C5.19951 20.1929 4.55126 18.0054 4.55126 18.0054C4.05156 16.7039 3.32904 16.3509 3.32904 16.3509C2.32965 15.6517 3.40331 15.6656 3.40331 15.6656C4.50399 15.7486 5.09147 16.8285 5.09147 16.8285C6.07059 18.5522 7.66421 18.0538 8.2922 17.7631C8.39349 17.0362 8.6771 16.5378 8.98772 16.254C6.55003 15.9771 3.98404 15.0079 3.98404 10.6883C3.98404 9.45611 4.40945 8.45235 5.11848 7.66319C5.00368 7.37244 4.62554 6.23023 5.21977 4.6796C5.21977 4.6796 6.14487 4.37501 8.24494 5.83565C9.12277 5.58644 10.0614 5.46184 11 5.45491C11.9319 5.46184 12.8772 5.58644 13.7551 5.83565C15.8551 4.37501 16.7802 4.6796 16.7802 4.6796C17.3812 6.23023 17.0031 7.37936 16.8883 7.66319C17.5905 8.45235 18.016 9.45611 18.016 10.6883C18.016 15.0218 15.4432 15.9702 12.992 16.254C13.3837 16.6001 13.7416 17.2924 13.7416 18.3446C13.7416 19.8537 13.7281 21.0651 13.7281 21.4389C13.7281 21.7435 13.9239 22.0896 14.4843 21.9789C18.8533 20.4836 22 16.2609 22 11.2836C22 5.04649 17.0773 0 11 0Z" fill="black"/></svg>',
      text: 'Наш GitHub',
      url: constants.contentRepGithub,
    },
    {
      emoji: '🔥',
      text: 'Горящий бэклог',
      url: constants.contentHotBacklogLink,
    },
  ],
  title: 'Друг для друга',
}

const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate))
  return arr.filter((_v, index) => results[index])
}

module.exports = {
  layout: 'base.njk',
  permalink: '/',
  documentTitle: 'Дока',
  documentDescription: 'Документация для разработчиков на понятном языке',

  eleventyComputed: {
    promoData: async function (data) {
      const { collections } = data
      const { promos } = collections

      const filteredPromos = await asyncFilter(promos, async (promo) => {
        const currentDate = new Date()
        const cache = promo.data
        return currentDate >= new Date(cache.startDate) && currentDate <= new Date(cache.endDate)
      })

      const formattedPromos = await Promise.all(
        filteredPromos.map(async (promo) => {
          // rawInput отдаёт текст уже без фронтматтера, поэтому прежний
          // split по «---» больше не нужен.
          const content = promo.rawInput ?? ''
          const cache = promo.data
          const output = {
            color: cache.color,
            content: content
              .split('\n')
              .filter((s) => s !== '')
              .join('\n'),
            design: cache.design,
            links: cache.links,
            title: cache.title,
          }
          return output
        }),
      )

      return formattedPromos[0] || defaultPromo
    },
  },
}
