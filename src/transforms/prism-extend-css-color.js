// css-extras понимает только устаревший синтаксис с запятыми (rgb(255, 0, 0)).
// Переопределяем 'color', чтобы ловить современный синтаксис и hwb/lab/lch/oklab/oklch/color()/color-mix() целиком.
module.exports = function (Prism) {
  var css = Prism.languages.css

  // Второй вызов затёр бы именованные цвета: ниже мы забираем их из css.color[0],
  // а после первого вызова там лежит уже наш паттерн с функциями.
  if (css.color.isExtendedByDoka) {
    return
  }

  var color = [
    // Функция — первой: relative syntax (rgb(from green ...)) иначе теряет
    // "green" в отдельный токен раньше, чем схватится вызов целиком.
    {
      // Один уровень вложенных скобок — его требуют relative syntax
      // (rgb(from hwb(...) r g b)) и calc() внутри каналов. Глубже вложенный
      // вызов матчится сам по себе, и превьюшка будет не от всего значения.
      pattern: /\b(?:hsla?|rgba?|hwb|lab|lch|oklab|oklch|color-mix|color)\((?:[^()]|\([^()]*\))*\)/i,
      inside: {
        unit: /\b(?:deg|grad|rad|turn)\b|%/,
        number: /-?\b\d*\.?\d+\b/,
        function: /[\w-]+(?=\()/,
        punctuation: /[(),/]/,
      },
    },
    css.color[0],
  ]
  color.isExtendedByDoka = true

  // Вставляем перед 'operator': оно режет слэш в rgb(... / ...) на отдельный токен,
  // а 'entity'/'unit'/'number' дробят числа — все три должны остаться после 'color',
  // иначе строка раздробится раньше, чем до неё дойдёт очередь.
  Prism.languages.insertBefore('css', 'operator', { color: color })
}
