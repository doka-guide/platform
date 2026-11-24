// navigator.onLine одному не верим. Браузер Dia на macOS отвечает false при
// работающей сети, и читатель видел офлайн-разметку ссылок без всякой причины.
// Поэтому «нет сети» подтверждается настоящим запросом. Обратная ошибка,
// true без сети, не страшна: страница просто не отметит недоступные ссылки.
export async function isOffline({ onLine = navigator.onLine, request = fetch } = {}) {
  if (onLine) {
    return false
  }

  try {
    // Манифест маленький и есть на любой сборке. Запрос без кеша и мимо
    // сервис-воркера: тот не перехватывает запросы данных из скриптов.
    await request('/manifest.json', { method: 'HEAD', cache: 'no-store' })
    return false
  } catch {
    return true
  }
}
