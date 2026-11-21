import { createTools } from '../core/webmcp-tools.js'

// Счётчик Метрики подключает nginx, а не шаблоны, поэтому номер здесь продублирован
const METRIKA_COUNTER = 83244811

// Оценивать можно только статью, на которой есть форма отзыва
const PAGE_GUARDS = {
  send_feedback: () => Boolean(document.querySelector('.feedback-form')),
}

function track(goal) {
  window.ym?.(METRIKA_COUNTER, 'reachGoal', goal)
}

// Каждый вызов инструмента — цель в Метрике: иначе не узнать, пользуются ли ими агенты
export function withTracking(tool, report = track) {
  return {
    ...tool,
    execute(input, options) {
      report(`webmcp_${tool.name}`)
      return tool.execute(input ?? {}, options)
    },
  }
}

export function init({ context, report = track } = {}) {
  // Спецификация перенесла API в document.modelContext, ранние сборки Chrome держат его в navigator
  const modelContext = context ?? document.modelContext ?? navigator.modelContext
  if (!modelContext?.registerTool) {
    return
  }

  const tools = createTools({
    fetch: (...args) => window.fetch(...args),
    confirm: (message) => window.confirm(message),
    location: window.location,
  })

  tools
    .filter((tool) => PAGE_GUARDS[tool.name]?.() ?? true)
    // registerTool отдаёт промис: отказ по одному инструменту не должен ронять остальные
    .forEach((tool) => Promise.resolve(modelContext.registerTool(withTracking(tool, report))).catch(console.error))

  // доля посетителей, чей браузер вообще умеет WebMCP
  report('webmcp_ready')
}

try {
  init()
} catch (error) {
  console.error(error)
}
