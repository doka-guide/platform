// На Mac модификаторы принято обозначать значками ⌃ и ⌥, как в меню приложений.
// Рисуем их в SVG, а не символами: в шрифте кода они выходят мелкими и неровными.
// Обработчику всё равно: ctrlKey и altKey срабатывают от control и option.
const appleModifiers = {
  ctrl: { name: 'control', path: 'M3 10.5 8 5.5l5 5' },
  alt: { name: 'option', path: 'M2 4.5h3.5l5 7H14M9.5 4.5H14' },
}

function createModifierIcon({ name, path }) {
  // <title> даёт и подсказку при наведении, и имя клавиши для скринридера
  return `<svg class="linked-article__modifier-icon" viewBox="0 0 16 16" role="img"><title>${name}</title><path d="${path}"/></svg>`
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
    key.innerHTML = createModifierIcon(appleModifiers[key.dataset.modifier])
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
