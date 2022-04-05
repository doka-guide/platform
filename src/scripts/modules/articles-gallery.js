function init() {
  const gallery = document.querySelector('.articles-gallery')

  if (!gallery) {
    return
  }

  const button = gallery.querySelector('.articles-gallery__more-button')

  if (!button) {
    return
  }

  const list = gallery.querySelector('.featured-artices-list')
  const items = Array.from(list?.querySelectorAll('.featured-artices-list__item') || [])

  if (items.length === 0) {
    return
  }

  const activeClass = 'featured-artices-list__item--active'

  const pageSize = parseInt(getComputedStyle(list).getPropertyValue('--page-size'), 10) || 1
  let lastItemIndex = pageSize

  function loadItems() {
    items.slice(lastItemIndex, lastItemIndex + pageSize).forEach((item) => {
      item.classList.add(activeClass)
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
