function init() {
  const rootElement = document.querySelector('.people-page')

  if (!rootElement) {
    return
  }

  const filter = rootElement.querySelector('.people-page__filter')
  const grid = rootElement.querySelector('.person-grid')
  const [allControl, ...restControls] = Array.from(rootElement.querySelectorAll('.tag-filter__control'))

  function getFiltersValues() {
    return restControls
      .filter(control => control.checked)
      .map(control => control.value)
  }

  function applyFilters() {
    grid.dataset.filters = getFiltersValues().join(',')
  }

  function saveToURL() {
    const entries = [...new FormData(filter).entries()]
      .filter(([, value]) => !!value)

    const serializedState = entries.length !== 0
      ? '?' + new URLSearchParams(entries)
      : window.location.pathname

    history.pushState(null, null, serializedState)
  }

  function initUIFromURL() {
    const params = new URLSearchParams(window.location.search)
    const entriesSet = new Set([...params.values()])

    for (const control of restControls) {
      control.checked = entriesSet.has(control.value)
    }

    allControl.checked = entriesSet.size === 0
  }

  function onFilterChange(event) {
    const { value, checked } = event.target

    switch (true) {
      case (!value && checked): {
        for (const control of restControls) {
          control.checked = false
        }
        break
      }

      case (!value && !checked): {
        allControl.checked = true
        break
      }

      case (value && checked): {
        allControl.checked = false
        break
      }

      case (value && !checked): {
        const filterValues = getFiltersValues()
        if (filterValues.length === 0) {
          allControl.checked = true
        }
        break
      }
    }

    applyFilters()
    saveToURL()
  }

  filter.addEventListener('change', onFilterChange)
  initUIFromURL()
  applyFilters()
}

init()
