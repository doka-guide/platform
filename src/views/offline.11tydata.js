module.exports = {
  title: 'Вы сейчас не в сети',
  layout: 'base.njk',
  permalink: '/offline/index.html',
  // Страница сама говорит, что сети нет: подсказка в углу повторила бы её и закрыла первую карточку
  isOfflineNoticeHidden: true,
}
