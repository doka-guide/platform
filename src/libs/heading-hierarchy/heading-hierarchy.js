const { escape } = require('html-escaper')

class Item {
  constructor(element) {
    this.element = element
    this.children = []
    this.parent = null
  }

  get content() {
    return this.element?.textContent
  }

  get id() {
    return this.element?.id
  }

  get level() {
    return parseInt(this.element?.tagName.slice(1) ?? 0)
  }

  toJSON() {
    return {
      id: this.id,
      content: this.content,
      level: this.level,
      children: this.children,
    }
  }
}

function getParent(prev, current) {
  if (current.level > prev.level) {
    // вложенный заголовок
    return prev
  } else if (current.level === prev.level) {
    // соседний
    return prev.parent
  } else {
    // выше уровнем, чем предыдущий
    return getParent(prev.parent, current)
  }
}

function createHierarchy(headings) {
  const rootItem = new Item()
  rootItem.parent = rootItem

  let previousItem = rootItem

  for (const heading of headings) {
    const currentItem = new Item(heading)
    const parentItem = getParent(previousItem, currentItem)
    currentItem.parent = parentItem
    parentItem.children.push(currentItem)
    previousItem = currentItem
  }

  return rootItem
}

function renderHead(item) {
  return `
    <a class="toc__link link" href="#${item.id}">
      ${escape(item.content)}
    </a>
  `
}

function renderChildren(children) {
  return `
    <ol class="toc__list base-list">
      ${children.map((child) => renderItem(child)).join('')}
    </ol>
  `
}

function renderItem(item) {
  const wrapper = item.level > 0 ? (content) => `<li class="toc__item">${content}</li>` : (content) => content

  return wrapper(`
    ${item.id && item.content ? renderHead(item) : ''}
    ${item.children?.length > 0 ? renderChildren(item.children) : ''}
  `)
}

function render(rootItem) {
  return `
    <div class="toc">
      ${renderItem(rootItem)}
    </div>
  `
}

module.exports = {
  createHierarchy,
  render,
}
