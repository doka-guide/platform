'use strict'

// Собирает тело пулреквеста с заметкой о превью.
//
// Заметка живёт в описании, а не отдельным комментарием: GitHub шлёт письмо на
// создание комментария, а правку описания не рассылает вовсе. Так ссылка на
// превью всегда на виду и не спамит подписчикам.
//
// Блок ограничен парой маркеров. При повторных запусках он заменяется целиком,
// а всё, что автор написал вокруг, остаётся нетронутым.

function buildBody(currentBody, marker, endMarker, message) {
  const block = `${marker}\n${message}\n${endMarker}`
  const body = currentBody || ''
  const start = body.indexOf(marker)
  const end = body.indexOf(endMarker)

  if (start !== -1 && end !== -1 && end > start) {
    return body.slice(0, start) + block + body.slice(end + endMarker.length)
  }

  // Блока ещё нет — дописываем в конец. У пустого описания не должно оказаться
  // ведущих переводов строки.
  const trimmed = body.trimEnd()
  return trimmed ? `${trimmed}\n\n${block}` : block
}

module.exports = { buildBody }
