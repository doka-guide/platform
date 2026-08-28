// Тесты выключенного сервис-воркера.
//
// Воркер отключён намеренно (почему — в комментарии в src/sw.js), и от него
// теперь требуется ровно одно: не вмешиваться в загрузку и убрать за собой.
// Эти тесты сторожат именно это, чтобы обработчики не вернулись по недосмотру.
//
// Файл воркера ничего не экспортирует, поэтому загружается с заглушкой вместо
// self, а из неё достаются зарегистрированные обработчики. Так проверяется
// настоящий отгружаемый код, а не его копия в тесте.

function loadWorker({ cacheNames = [] } = {}) {
  const listeners = {}
  const deleted = []
  const calls = { skipWaiting: 0, unregister: 0 }

  global.self = {
    registration: {
      unregister: async () => {
        calls.unregister += 1
      },
    },
    skipWaiting: () => {
      calls.skipWaiting += 1
    },
    addEventListener: (type, handler) => {
      listeners[type] = handler
    },
  }

  global.caches = {
    keys: async () => cacheNames,
    delete: async (name) => {
      deleted.push(name)
      return true
    },
  }

  jest.isolateModules(() => {
    require('../sw.js')
  })

  return { listeners, deleted, calls }
}

// Событие activate в том виде, в каком его видит воркер: работа отдаётся
// браузеру через waitUntil, и дождаться её можно только оттуда.
function createActivateEvent() {
  const event = {
    waitUntil: (promise) => {
      event.pending = promise
    },
  }
  return event
}

describe('сервис-воркер выключен', () => {
  afterEach(() => {
    delete global.self
    delete global.caches
  })

  it('не подписывается на fetch', () => {
    // Главная гарантия: воркер не перехватывает запросы, и всё грузится из сети
    // напрямую. Прежний обработчик падал на каждом запросе, а починить его
    // мало — сломан и слой кеширования под ним.
    const { listeners } = loadWorker()

    expect(listeners.fetch).toBeUndefined()
  })

  it('не подписывается на message и sync', () => {
    const { listeners } = loadWorker()

    expect(listeners.message).toBeUndefined()
    expect(listeners.sync).toBeUndefined()
  })

  it('при установке не ждёт закрытия старых вкладок', () => {
    // Без skipWaiting новый воркер простоял бы в очереди за старым, и снятие
    // регистрации откладывалось бы до закрытия всех вкладок.
    const { listeners, calls } = loadWorker()

    listeners.install()

    expect(calls.skipWaiting).toBe(1)
  })

  it('снимает регистрацию при активации', async () => {
    const { listeners, calls } = loadWorker()
    const event = createActivateEvent()

    listeners.activate(event)
    await event.pending

    expect(calls.unregister).toBe(1)
  })

  it('отдаёт уборку браузеру через waitUntil', async () => {
    // Без waitUntil браузер вправе усыпить воркер посреди уборки, и кеши
    // остались бы недочищенными.
    const { listeners } = loadWorker()
    const event = createActivateEvent()

    listeners.activate(event)

    expect(event.pending).toBeInstanceOf(Promise)
    await event.pending
  })

  it('чистит кеши, которые завёл прежний воркер', async () => {
    const { listeners, deleted } = loadWorker({
      cacheNames: ['doka-assets-even', 'doka-dynamic-even', 'doka-static-odd'],
    })
    const event = createActivateEvent()

    listeners.activate(event)
    await event.pending

    expect(deleted.sort()).toEqual(['doka-assets-even', 'doka-dynamic-even', 'doka-static-odd'])
  })

  it('не трогает чужие кеши на том же домене', async () => {
    const { listeners, deleted } = loadWorker({
      cacheNames: ['doka-assets-even', 'workbox-precache', 'some-other-cache'],
    })
    const event = createActivateEvent()

    listeners.activate(event)
    await event.pending

    expect(deleted).toEqual(['doka-assets-even'])
  })

  it('переживает пустой список кешей', async () => {
    const { listeners, deleted, calls } = loadWorker({ cacheNames: [] })
    const event = createActivateEvent()

    listeners.activate(event)
    await event.pending

    expect(deleted).toEqual([])
    expect(calls.unregister).toBe(1)
  })
})
