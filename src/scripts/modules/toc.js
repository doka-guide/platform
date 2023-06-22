import debounce from '../libs/debounce.js'

/*
  Описание алгоритма:

  Будем считать активной ту секцию статьи, `titleThreshold * titleHeight` заголовка которой находится выше значения `getWindowThresholdPosition()`.
  При срабатывании Intersection Observer находим видимые заголовки, берём последний из них.
  Если таковых не оказалось, ищем ближайший неактивный заголовок выше значения `getWindowThresholdPosition()`.
*/
function init() {
  const TOC_CONTAINER_SELECTOR = '.toc'
  const TOC_LINK_SELECTOR = '.toc__link'
  const HEADING_SELECTOR = '.article-heading'
  const HEADING_COPY_BUTTON_SELECTOR = '.article-heading__copy-button'

  const links = Array.from(document.querySelectorAll(TOC_LINK_SELECTOR))
  const titles = Array.from(document.querySelectorAll(HEADING_SELECTOR)).filter((title) => !title.closest('details'))

  if (!(links.length && titles.length)) {
    return
  }

  const linksMap = {}
  const titlesMap = {}
  let lastActiveTitle
  let observer

  const activeLinkClass = 'toc__link--active'
  const visibleHeadingClass = 'article-heading--visible'

  const titleThreshold = 0

  function getWindowThresholdPosition() {
    return parseFloat(window.getComputedStyle(titles[0]).scrollMarginTop)
  }

  function findNearestTitle() {
    return titles
      .filter((title) => {
        const titleBox = title.getBoundingClientRect()
        const windowThresholdPosition = getWindowThresholdPosition()
        const titleThresholdPosition = titleBox.top + titleBox.height * titleThreshold
        const titleIsAbove = titleThresholdPosition < windowThresholdPosition
        return titleIsAbove
      })
      .pop()
  }

  function setActiveTitle(title) {
    linksMap[lastActiveTitle?.id]?.classList.remove(activeLinkClass)
    linksMap[title?.id]?.classList.add(activeLinkClass)
    lastActiveTitle = title
  }

  function observerCallback(entries) {
    for (const entry of entries) {
      entry.target.classList.toggle(visibleHeadingClass, entry.isIntersecting)
    }

    const visibleTitles = titles.filter((title) => title.classList.contains(visibleHeadingClass))
    const lastVisibleTitle = visibleTitles.pop() || findNearestTitle()

    if (lastVisibleTitle) {
      setActiveTitle(lastVisibleTitle)
    }
  }

  function getTitleFromHash(hash) {
    const titleId = hash.slice(1)
    return titlesMap[titleId]?.element
  }

  function getTitleScrollPosition(title) {
    const titleBox = title?.getBoundingClientRect()

    const additionalOffset = 1 // небольшой отступ, чтобы заголовок гарантировано пересёк границу и стал активным
    return (
      window.scrollY +
      (titleBox.top + titleBox.height * titleThreshold + additionalOffset) -
      getWindowThresholdPosition()
    )
  }

  function saveLink(link, button) {
    try {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          try {
            if (window.matchMedia('(max-width: 720px)').matches) {
              const popup = document.querySelector('.doc__popup')

              popup.hidden = false

              setTimeout(() => {
                popup.hidden = true
              }, 2000)
            } else {
              const icon = button.firstElementChild
              const status = button.nextElementSibling

              button.disabled = true
              icon.outerHTML = `
              <svg class="article-heading__icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="m8.77,19.52l-6.97,-7.11l1.38,-1.43l5.6,5.71l12.04,-12.25l1.38,1.43l-13.41,13.65l-0.02,0z"></path>
              </svg>
              `
              status.textContent = 'Скопировано'
              status.hidden = false

              setTimeout(() => {
                button.disabled = false
                button.firstElementChild.outerHTML = icon.outerHTML

                const isParallelCopying = document.querySelector(`${HEADING_COPY_BUTTON_SELECTOR}:disabled`)
                  ? true
                  : false

                if (document.activeElement === document.body && !isParallelCopying) {
                  // восстанавливаем фокус на последней нажатой кнопке
                  button.focus()
                }

                status.textContent = undefined
                status.hidden = true
              }, 1800)
            }
          } catch (error) {
            console.log(`Ошибка с подсказкой об успешном копировании ссылки: ${error.message}`)
          }
        })
        .catch((error) => console.log(`Ошибка при копировании ссылки: ${error.message}`))
    } catch (error) {
      console.log(`Возможно, соединение незащищенное. Ошибка: ${error.message}`) // доступ к clipboard работает только с https
    }
  }

  function scrollToTitle(hash) {
    const title = getTitleFromHash(hash)
    window.scrollTo({
      top: getTitleScrollPosition(title),
      behavior: 'smooth',
    })
  }

  links.forEach((link) => {
    const titleId = link.hash.slice(1)
    linksMap[titleId] = link
  })

  titles.forEach((title, index) => {
    titlesMap[title.id] = {
      element: title,
      index,
    }
  })

  function createObserver() {
    observer = new IntersectionObserver(observerCallback, {
      rootMargin: `0px 0px -${window.innerHeight - getWindowThresholdPosition()}px 0px`,
      threshold: [titleThreshold],
    })

    titles.forEach((title) => {
      observer.observe(title)
    })
  }

  function destroyObserver() {
    titles.forEach((title) => {
      observer.unobserve(title)
    })

    observer.disconnect()
    observer = null
  }

  function initObserver() {
    if (observer) {
      destroyObserver()
    }

    createObserver()

    titles.forEach((title) => {
      observer.observe(title)
    })
  }

  // делаем как макро-задачу, чтобы компонент header успел посчитать размеры
  setTimeout(initObserver)

  window.addEventListener('resize', debounce(initObserver, 200))

  window.addEventListener('load', () => {
    const nearestTitle = findNearestTitle()
    if (nearestTitle) {
      setActiveTitle(nearestTitle)
    }
  })

  document.querySelector(TOC_CONTAINER_SELECTOR)?.addEventListener('click', (event) => {
    const link = event.target.closest(`${TOC_LINK_SELECTOR}, ${HEADING_COPY_BUTTON_SELECTOR}`)

    if (!link) {
      return
    }

    event.preventDefault()
    scrollToTitle(link.hash)
  })

  document.querySelectorAll(HEADING_COPY_BUTTON_SELECTOR)?.forEach((item) =>
    item.addEventListener('click', (event) => {
      const button = event.target.closest(HEADING_COPY_BUTTON_SELECTOR)
      let link = document.location.href + button.dataset.anchor

      if (document.location.hash) {
        link = link.replace(document.location.hash, '')
      }

      event.preventDefault()
      saveLink(link, button)
    })
  )

  function headingsScaler() {
    const articleHeadings = document.querySelectorAll(HEADING_SELECTOR)

    for (const heading of articleHeadings) {
      const copier = heading.querySelector('.article-heading__copier')
      const status = copier.querySelector('.article-heading__status')

      const headingPosition = heading.getBoundingClientRect()
      const copierPosition = copier.getBoundingClientRect()

      if (headingPosition.left === copierPosition.left) {
        heading.style.width = `${heading.offsetWidth - copier.offsetWidth * 1.1}px`
      }

      status.hidden = true
      status.textContent = '' // Статус должен быть пустым, чтобы его гарантированно не читали скринридеры. Вызвано особенностью работы скринридеров с атрибутом `aria-describedby`.
    }
  }

  headingsScaler()
}

init()
