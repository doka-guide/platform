// Счётчик Метрики подключает nginx, а не шаблоны, поэтому номер здесь продублирован
export const METRIKA_COUNTER = 83244811

// Параметры кладём под именем цели: в отчёте «Параметры визитов» они соберутся в дерево по целям
export function reachGoal(goal, params) {
  window.ym?.(METRIKA_COUNTER, 'reachGoal', goal, params ? { [goal]: params } : undefined)
}
