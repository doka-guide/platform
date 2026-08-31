# Частые задачи

Короткие рецепты для типовых правок платформы. Общее устройство сборки описано в [руководстве по работе Доки](how-its-work.md), запуск — [в руководстве по запуску](how-to-run.md).

## Добавить блок на страницу статьи

1. Шаблон блока — `src/includes/blocks/my-block.njk`.
2. Стили — `src/styles/blocks/my-block.css` плюс `@import` в `src/styles/index.css`.
3. Подключить в `src/views/doc.njk`: `{% include "blocks/my-block.njk" %}`.

## Добавить вычисляемое поле к данным статьи

В `src/views/doc.11tydata.js`, в объект `eleventyComputed`:

```js
myField: function (data) {
  const { doc } = data
  return doc.data.someField
}
```

## Добавить трансформацию

1. Создать `src/transforms/my-transform.js` — экспортировать функцию `(window, content, outputPath)`. Почти всем трансформациям нужен только `window`: разметка правится в нём на месте, возвращать ничего не надо.
2. Подключить в `.eleventy.js`, в массиве `transforms`.
3. Покрыть тестом в `src/transforms/__tests__/` — трансформация принимает разметку и возвращает разметку, это самый дешёвый вид теста в проекте.

## Добавить клиентский модуль

1. Создать `src/scripts/modules/my-module.js`.
2. Импортировать в `src/scripts/index.js`.
3. Класс компонента наследовать от `BaseComponent` из `src/scripts/core/base-component.js` — он расширяет `EventTarget` и добавляет `on`, `off`, `emit`.

Модули инициализируются по наличию своих элементов в DOM.

## Добавить страницу нового типа

Кроме шаблона и данных, допишите страницу в список `PAGES` в `scripts/lint-html.js` — иначе новый тип страницы останется без проверки разметки.

---

# Полезные детали

**Фронтматтер статьи.** Данные материала приходят из репозитория контента:

```yaml
title: 'Заголовок'
description: 'Описание'
tags: [doka] # или [article], или [placeholder]
authors: [username]
contributors: [username]
editors: [username]
createdAt: '2021-01-01'
updatedAt: '2022-06-15'
cover:
  author: username
  desktop: desktop.png
  og: og.png
  twitter: twitter.png
related:
  - css/display
  - js/array
baseline:
  - group: css-display
    features: [display-flex]
```

**Baseline.** Данные о поддержке браузерами берутся из npm-пакета `web-features`. Статья объявляет блок `baseline:` во фронтматтере, версии браузеров платформа достаёт сама.

**Featured-статьи.** Список читается из `src/settings/featured.md` — файл приходит из репозитория контента через симлинк. Максимум 12 штук.

**Сортировка статей.** Внутри раздела материалы сортируются по названию без учёта регистра и не-буквенных символов, чтобы порядок был стабильным между пересборками.

**Темы.** Светлая, тёмная и авто; выбор хранится в `localStorage` под ключом `color-theme`. Цвета тем — в `src/styles/base-colors.css`, `light-theme.css`, `dark-theme.css`. Цвета разделов задаются дважды: в `config/category-colors.js` для JavaScript и переменными CSS в темах.

**Service Worker.** Отключён. `src/sw.js` остался заглушкой, которая снимает регистрацию и чистит кеши у тех, кому старый воркер успел установиться, — поэтому файл нельзя удалять, он должен и дальше отдаваться по `/sw.js`. Причины отключения — в комментарии в самом файле.

**Social cards.** Шаблоны `sc.njk` и `sc-index.njk` собирают отдельные HTML-страницы карточек для соцсетей — `*/index.sc.html` в `dist`. Картинки с них снимаются вне этого репозитория, в платформе есть только разметка.

**RSS-фид.** `/feed/index.xml` в формате Atom. Список материалов берётся не из коллекций, а из `CHANGELOG.md` репозитория контента: он скачивается с `raw.githubusercontent.com` на этапе сборки и разбирается в `src/libs/changelog-parser/`. В фид уходят 50 последних записей, у каждой — обложка (та же картинка, что в `og:image` материала) и описание из фронтматтера. Описание берётся только у материалов, которые есть в сборке, поэтому при частичном `CONTENT_REP_FOLDERS` часть записей останется без текста — на боевой сборке подключён весь контент.

**markdown-it.** Конфигурация в `src/markdown-it.js`: `html: true`, `breaks: true`, `linkify: false` (URL не превращаются в ссылки автоматически). Подсветка кода отдаётся CSS: рендерер оборачивает блок в `<pre data-lang="js"><code>…</code></pre>`. Есть свой рендерер `html_block` для `<video>` — оборачивает видео в `<figure>` с подписью.
