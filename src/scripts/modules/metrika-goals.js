import { reachGoal } from '../core/metrika.js'

// Клики видны на картах Метрики, а копирование выделением — нет: команду MCP и код из статьи копируют руками
export const COPY_GOALS = [
  { goal: 'main_mcp_copy', selector: '.intro__command' },
  { goal: 'article_code_select_copy', selector: '.article__content-inner pre, .article__content-inner code' },
]

export function findGoal(target, rules = COPY_GOALS) {
  const element = target instanceof Text ? target.parentElement : target

  if (!(element instanceof Element)) {
    return null
  }

  return rules.find((rule) => element.closest(rule.selector))?.goal ?? null
}

export function init(root = document, report = reachGoal) {
  root.addEventListener('copy', () => {
    const goal = findGoal(document.getSelection()?.anchorNode)
    if (goal) {
      report(goal)
    }
  })

  // Цели-страницы вроде 404 и офлайна размечены прямо в шаблоне
  root.querySelectorAll('[data-page-goal]').forEach((element) => {
    report(element.dataset.pageGoal)
  })
}

try {
  init()
} catch (error) {
  console.error(error)
}
