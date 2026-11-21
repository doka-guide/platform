import { reachGoal } from '../core/metrika.js'

function href(element) {
  return { url: element.getAttribute('href') }
}

function positionIn(itemSelector) {
  return (element) => {
    const item = element.closest(itemSelector)
    const items = Array.from(item?.parentElement?.children || []).filter((child) => child.matches(itemSelector))
    return { position: items.indexOf(item) + 1, url: element.getAttribute('href') }
  }
}

// Правила проверяются по порядку, срабатывает первое: узкие селекторы стоят выше общих
export const CLICK_GOALS = [
  // Главная
  {
    goal: 'main_featured_click',
    selector: '.intro ~ .articles-gallery .featured-article__link',
    params: positionIn('.featured-articles-list__item'),
  },
  { goal: 'main_featured_more', selector: '.intro ~ .articles-gallery .articles-gallery__more-button' },
  { goal: 'main_mcp_click', selector: '.intro__pitch--dashed a', params: href },
  { goal: 'main_promo_click', selector: '.intro__pitch a', params: href },
  { goal: 'main_index_click', selector: '.article-indexes-list__link, .index-group-list__link', params: href },

  // Шапка и поиск
  { goal: 'header_logo_click', selector: '.header__logo a' },
  { goal: 'header_category_click', selector: '.header__category a', params: href },
  { goal: 'header_menu_toggle', selector: '.header__buttons .header-button:not(.search__reset-button)' },
  { goal: 'header_nav_click', selector: '.nav-list__link', params: href },
  { goal: 'search_suggestion_click', selector: '.suggestion-list__link', params: positionIn('.suggestion-list__item') },
  { goal: 'search_full_link', selector: '.search__full-link' },
  { goal: 'search_hit_click', selector: '.search-hit__link', params: positionIn('.search-result-list__item') },

  // Статья
  { goal: 'article_toc_click', selector: '.toc__link', params: href },
  {
    goal: 'article_related_click',
    selector: '.doc__related-articles .featured-article__link',
    params: positionIn('.featured-articles-list__item'),
  },
  { goal: 'article_related_more', selector: '.doc__related-articles .articles-gallery__more-button' },
  {
    goal: 'article_linked_click',
    selector: '.linked-article__link',
    params: (element) => ({
      type: element.closest('.linked-article--previous') ? 'previous' : 'next',
      url: element.getAttribute('href'),
    }),
  },
  { goal: 'article_category_click', selector: '.article__category-link', params: href },
  { goal: 'article_edit_click', selector: '.article__edit-button' },
  { goal: 'article_person_click', selector: '.persons-list__name', params: href },
  { goal: 'article_persons_more', selector: '.persons-list__button' },
  { goal: 'article_copy_code', selector: '.block-code__copy-button' },
  { goal: 'article_demo_open', selector: '.figure__caption a[target="_blank"]', params: href },
  { goal: 'article_baseline_click', selector: '.wdi-browser-compat__link', params: href },
  { goal: 'article_practices_toggle', selector: '.practices__toggler' },
  { goal: 'article_answer_toggle', selector: '.answer__toggler' },
  { goal: 'article_nav_toggle', selector: '.article-nav__toggle' },
  { goal: 'article_content_link', selector: '.article__content-inner a[href]', params: href },

  // Сервисное
  {
    goal: 'theme_change',
    selector: '.theme-toggle__control',
    params: (element) => ({ theme: element.value }),
  },
  { goal: 'cookie_accept', selector: '.cookie-notification .notification__button' },
  { goal: 'top_banner_click', selector: '.top-banner__button' },
  { goal: 'footer_click', selector: '.footer-list__link, .github-button', params: href },
]

// Копирование выделением, без кнопки: команду MCP и код из статьи копируют руками
export const COPY_GOALS = [
  { goal: 'main_mcp_copy', selector: '.intro__command' },
  { goal: 'article_code_select_copy', selector: '.article__content-inner pre, .article__content-inner code' },
]

export function findGoal(target, rules = CLICK_GOALS) {
  const element = target instanceof Text ? target.parentElement : target

  if (!(element instanceof Element)) {
    return null
  }

  for (const rule of rules) {
    const match = element.closest(rule.selector)
    if (match) {
      return { goal: rule.goal, params: rule.params?.(match) }
    }
  }

  return null
}

export function init(root = document, report = reachGoal) {
  // Перехват на погружении: обработчики компонентов, которые зовут stopPropagation, не съедят цель
  root.addEventListener(
    'click',
    (event) => {
      const match = findGoal(event.target)
      if (match) {
        report(match.goal, match.params)
      }
    },
    true,
  )

  root.addEventListener('copy', () => {
    const match = findGoal(document.getSelection()?.anchorNode, COPY_GOALS)
    if (match) {
      report(match.goal)
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
