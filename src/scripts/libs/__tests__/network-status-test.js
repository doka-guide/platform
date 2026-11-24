const { isOffline } = require('../network-status.js')

const reachable = async () => new Response(null)
const unreachable = async () => {
  throw new TypeError('Failed to fetch')
}

test('браузер говорит, что сеть есть, — верим без запроса', async () => {
  const request = jest.fn(unreachable)

  expect(await isOffline({ onLine: true, request })).toBe(false)
  expect(request).not.toHaveBeenCalled()
})

test('браузер говорит, что сети нет, а сервер отвечает, — сеть есть', async () => {
  // Так ведёт себя Dia на macOS: onLine равно false при работающей сети
  expect(await isOffline({ onLine: false, request: reachable })).toBe(false)
})

test('браузер говорит, что сети нет, и сервер не отвечает, — сети нет', async () => {
  expect(await isOffline({ onLine: false, request: unreachable })).toBe(true)
})

test('проверочный запрос идёт мимо кеша браузера', async () => {
  // Из кеша ответ пришёл бы и без сети
  const request = jest.fn(reachable)

  await isOffline({ onLine: false, request })

  expect(request).toHaveBeenCalledWith('/manifest.json', expect.objectContaining({ cache: 'no-store' }))
})
