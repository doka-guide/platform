// Встраивается в <head> до отрисовки, чтобы глаза-снежинки в логотипе не появлялись после загрузки.
// Даты проверяются в браузере, а не при сборке: сайт не пересобирают ровно 20 декабря и 12 января,
// а снег прошлых лет приходилось выключать отдельным коммитом
;(function () {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()

  if (!((month === 11 && day >= 20) || (month === 0 && day <= 11))) {
    return
  }

  document.documentElement.classList.add('new-year')

  console.log(
    [
      '%c        *',
      '       { }',
      '      < ; >',
      '     { ; ; }',
      '    < ; ; ; >',
      '   { ; ; ; ; }',
      '        ||',
      '',
      '%cИщете баги в праздники? Они тоже ушли на каникулы.',
      'С Новым годом! Дока',
    ].join('\n'),
    'color: #2e9e4f; font-weight: bold',
    'color: inherit',
  )
})()
