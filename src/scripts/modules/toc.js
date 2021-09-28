function init() {
  const links = document.querySelectorAll('.toc__link')
  const titles = document.querySelectorAll('.article-heading__title')

  if (!links.legnth && !titles.length) {
    return
  }

  const linksMap = {}
  const titlesMap = {}
  let lastActiveElement = titles[0]
  let lastScrollPosition = window.scrollY;

  const activeClass = 'toc__link--active'

  const threshold = 0.5

  const observerOptions = {
    rootMargin: '0px 0px -50% 0px',
    threshold: [threshold],
  }

  function findNearestTitle() {
    const halfWindowHeight = window.innerHeight / 2
    return Array.from(titles)
      .filter(title => {
        const titleBox = title.getBoundingClientRect()
        return titleBox.top - titleBox.height * threshold <= halfWindowHeight
      })
      .pop()
  }

  function setActiveTitle(title) {
    linksMap[lastActiveElement?.id]?.classList.remove(activeClass)
    linksMap[title?.id]?.classList.add(activeClass)
    lastActiveElement = title
  }

  function observerCallback(entries) {
    let scrollPosition = window.scrollY
    const scrollDirection = scrollPosition - lastScrollPosition
    lastScrollPosition = scrollPosition

    const currentTitle = entries
      .filter(entry => entry.isIntersecting)
      .pop()
      ?.target

    if (currentTitle) {
      setActiveTitle(currentTitle)
    } else if (scrollDirection < 0) {
      const lastTitleData = titlesMap[lastActiveElement?.id]
      const newLastTitleIndex = lastTitleData?.index > 0 ? lastTitleData.index - 1 : 0
      const newLastTitle = titles[newLastTitleIndex]
      setActiveTitle(newLastTitle)
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

  const nearestTitle = findNearestTitle()
  if (nearestTitle) {
    setActiveTitle(nearestTitle)
  }

  if (window.location.hash) {
    scrollToTitle(window.location.hash)
  }

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
