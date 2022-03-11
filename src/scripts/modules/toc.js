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
  const HEADING_LINK_SELECTOR = '.article-heading__link'

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

  function saveHistory(hash) {
    history.pushState(null, null, hash)
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
    const link = event.target.closest(`${TOC_LINK_SELECTOR}, ${HEADING_LINK_SELECTOR}`)

    if (!link) {
      return
    }

    event.preventDefault()
    scrollToTitle(link.hash)
    saveHistory(link.hash)
  })
}

init()
