/*
  Описание алгоритма:

  Будем считать активной ту секцию статьи, середина заголовка которой находится выше середины экрана.
  При срабатывании Intersection Observer находим видимые заголовки, берём последний из них.
  Если таковых не оказалось ищем ближайший неактивный заголовок выше середины экрана.
*/
function init() {
  const links = Array.from(document.querySelectorAll('.toc__link'))
  const titles = Array.from(document.querySelectorAll('.article-heading'))
    .filter(title => !title.closest('details'))

  if (!(links.length && titles.length)) {
    return
  }

  const linksMap = {}
  const titlesMap = {}
  let lastActiveTitle

  const activeLinkClass = 'toc__link--active'
  const visibleHeadingClass = 'article-heading--visible'

  const threshold = 0.5

  const observerOptions = {
    rootMargin: '0px 0px -50% 0px',
    threshold: [threshold],
  }

  function findNearestTitle() {
    const halfWindowHeight = window.innerHeight / 2
    return titles
      .filter(title => {
        const titleBox = title.getBoundingClientRect()
        const windowCenterPosition = halfWindowHeight
        const titleCenterPosition = titleBox.top + titleBox.height * threshold
        const titleIsAbove = titleCenterPosition < windowCenterPosition
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

    const visibleTitles = titles.filter(title => title.classList.contains(visibleHeadingClass))
    const lastVisibleTitle = visibleTitles.pop() || findNearestTitle()

    if (lastVisibleTitle) {
      setActiveTitle(lastVisibleTitle)
    }
  }

  function getTitleCenterPosition(title) {
    const titleBox = title?.getBoundingClientRect()

    const additionalOffset = 5 // небольшой отступ, чтобы заголовок гарантировано пересёк границу и стал активным
    return window.scrollY + (titleBox.top + titleBox.height * threshold + additionalOffset) - window.innerHeight / 2
  }

  function getTitleFromHash(hash) {
    const titleId = hash.slice(1)
    return titlesMap[titleId]?.element
  }

  function scrollToTitle(hash) {
    const title = getTitleFromHash(hash)

    window.scrollTo({
      top: getTitleCenterPosition(title),
      behavior: 'smooth'
    })

    history.pushState(null, null, hash)
  }

  links.forEach(link => {
    const titleId = link.hash.slice(1)
    linksMap[titleId] = link
  })

  titles.forEach((title, index) => {
    titlesMap[title.id] = {
      element: title,
      index
    }
  })

  const observer = new IntersectionObserver(observerCallback, observerOptions)

  titles.forEach(title => {
    observer.observe(title)
  })

  window.addEventListener('load', () => {
    const nearestTitle = findNearestTitle()
    if (nearestTitle) {
      setActiveTitle(nearestTitle)
    }

    if (window.location.hash) {
      scrollToTitle(window.location.hash)
    }
  })

  document.querySelector('.toc')?.addEventListener('click', event => {
    const link = event.target.closest('.toc__link')

    if (!link) {
      return
    }

    event.preventDefault()
    scrollToTitle(link.hash)
  })
}

init()
