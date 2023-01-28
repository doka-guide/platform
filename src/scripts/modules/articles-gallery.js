function init() {
  const gallery = document.querySelector('.articles-gallery')

  if (!gallery) {
    return
  }

  const button = gallery.querySelector('.articles-gallery__more-button')

  if (!button) {
    return
  }

  const list = gallery.querySelector('.featured-articles-list')
  const items = Array.from(list?.querySelectorAll('.featured-articles-list__item') || [])

  if (items.length === 0) {
    return
  }

  const activeClass = 'featured-articles-list__item--active'
  const linkClass = '.featured-article__link'

  const pageSize = parseInt(getComputedStyle(list).getPropertyValue('--page-size'), 10) || 1
  let lastItemIndex = pageSize

  function loadItems() {
    items.slice(lastItemIndex, lastItemIndex + pageSize).forEach((item, index) => {
      item.classList.add(activeClass)

      if (index === 0) {
        item.querySelector(linkClass).focus()
      }
    })

    lastItemIndex += pageSize

    if (lastItemIndex >= items.length) {
      button.hidden = true
    }
  }

  button.addEventListener('click', loadItems)
}

try {
  init()
} catch (error) {
  console.error(error)
}
