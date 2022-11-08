// Слушаем события с тултипами
function initTooltip(tooltipContainer) {
  const trigger = tooltipContainer.querySelector('.person-badges__default-image')
  const tooltip = tooltipContainer.querySelector('.person-badges__pop-up-container')

  // Показываем тултип при наведении курсора и при фокусе
  tooltipContainer.addEventListener('mouseenter', () => {
    showTooltip(tooltip)
  })
  trigger.addEventListener('focus', () => {
    showTooltip(tooltip)
  })

  // Прячем тултип, когда курсор не на значке и фокус на другом элементе
  tooltipContainer.addEventListener('mouseleave', () => {
    hideTooltip(tooltip)
  })
  trigger.addEventListener('blur', () => {
    hideTooltip(tooltip)
  })

  // Скрываем тултип при нажатии на Esc
  trigger.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideTooltip(tooltip)
    }
  })
}

function showTooltip(tooltip) {
  tooltip.style.display = 'grid'
}

function hideTooltip(tooltip) {
  tooltip.style.display = 'none'
}

window.addEventListener('load', () => {
  // Вызываем функцию
  const tooltips = document.querySelectorAll('.person-badges__sign')

  tooltips.forEach((tooltip) => {
    initTooltip(tooltip)
  })
})
