// На Mac модификаторы принято обозначать значками, как в меню приложений.
// Обработчику всё равно: ctrlKey и altKey срабатывают от control и option.
const appleModifiers = {
  ctrl: { symbol: '⌃', name: 'control' },
  alt: { symbol: '⌥', name: 'option' },
}

export function isApplePlatform(platform) {
  return /mac|iphone|ipad/i.test(platform)
}

// Шаблон отдаёт подписи для Windows и Linux, а на Mac скрипт их подменяет:
// при сборке система читателя неизвестна.
export function localizeHotkeys(root, platform) {
  if (!isApplePlatform(platform)) {
    return
  }

  root.querySelectorAll('.linked-article__hotkeys [data-modifier]').forEach((key) => {
    const { symbol, name } = appleModifiers[key.dataset.modifier]
    key.textContent = symbol
    // Значки знакомы не всем, поэтому название клавиши всплывает при наведении
    key.title = name
  })
}

function init() {
  localizeHotkeys(document, navigator.userAgentData?.platform || navigator.platform)

  const [previous, next] = [
    document.querySelector('.linked-article--previous .linked-article__link'),
    document.querySelector('.linked-article--next .linked-article__link'),
  ]

  if (!(previous && next)) {
    return
  }

  function goToArticle(event) {
    if (!(event.ctrlKey && event.altKey)) {
      return
    }

    const link = {
      ArrowLeft: previous,
      ArrowRight: next,
    }[event.code]

    if (!link) {
      return
    }

    window.location = link.href
  }

  document.addEventListener('keyup', goToArticle)
}

init()
