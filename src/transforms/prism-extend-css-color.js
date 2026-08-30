// css-extras понимает только устаревший синтаксис с запятыми (rgb(255, 0, 0)).
// Переопределяем 'color', чтобы ловить современный синтаксис и hwb/lab/lch/oklab/oklch/color()/color-mix() целиком.
module.exports = function (Prism) {
  var namedColors = Prism.languages.css.color[0]

  // Вставляем перед 'operator': оно режет слэш в rgb(... / ...) на отдельный токен,
  // а 'entity'/'unit'/'number' дробят числа — все три должны остаться после 'color',
  // иначе строка раздробится раньше, чем до неё дойдёт очередь.
  Prism.languages.insertBefore('css', 'operator', {
    color: [
      // Функция — первой: relative syntax (rgb(from green ...)) иначе теряет
      // "green" в отдельный токен раньше, чем схватится вызов целиком.
      {
        pattern: /\b(?:hsla?|rgba?|hwb|lab|lch|oklab|oklch|color-mix|color)\((?:[^()]|\([^()]*\))*\)/i,
        inside: {
          unit: /\b(?:deg|grad|rad|turn)\b|%/,
          number: /-?\b\d*\.?\d+\b/,
          function: /[\w-]+(?=\()/,
          punctuation: /[(),/]/,
        },
      },
      namedColors,
    ],
  })
}
