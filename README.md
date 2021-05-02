# Платформа Доки

Дока — это добрая энциклопедия для веб-разработчиков. Наша цель — сделать документацию по веб-разработке практичной, понятной и не унылой.

Этот репозиторий содержит платформу для сайта «[Дока](https://y-doka.site/)». Платформа собирает статьи из [отдельного репозитория](https://github.com/y-doka/content).

## Как устроен сайт

Сайт «Доки» работает на базе [Eleventy](https://www.11ty.dev). При помощи Nunjucks-темплейтов Eleventy превращает статьи в формате Markdown в HTML-страницы.

Проект [собирается через GitHub Actions](./docs/deploy.md) и публикуется в Netlfiy.

## Как работать

Для работы с платформой вам потребуется [Node.js v14+](https://nodejs.org/en/) и npm v7+.

Чтобы запустить Доку локально, нужно:

1. Скачать репозиторий.
1. Установить зависимости командой `npm i`.
1. Запустить локальный веб-сервер командой `npm start`.

Больше вариантов локального запуска Доки — [в руководстве по запуску](docs/how-to-run.md)
