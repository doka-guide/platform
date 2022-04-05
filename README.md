# Платформа Доки

[![Статус линтера](https://github.com/doka-guide/platform/actions/workflows/linting.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/linting.yml)
[![W3C Validator](https://github.com/doka-guide/platform/actions/workflows/w3c-validator.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/w3c-validator.yml)
[![Статус деплоя](https://github.com/doka-guide/platform/actions/workflows/product-deploy.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/product-deploy.yml)
[![Статус Docker](https://github.com/doka-guide/platform/actions/workflows/docker-deploy.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/docker-deploy.yml)

Дока — это добрая энциклопедия для веб-разработчиков. Наша цель — сделать документацию по веб-разработке практичной, понятной и не унылой.

Этот репозиторий содержит платформу для сайта «[Дока](https://doka.guide/)». Платформа собирает статьи из [отдельного репозитория](https://github.com/doka-guide/content).

## Как устроен сайт

Сайт «Доки» работает на базе [Eleventy](https://www.11ty.dev). При помощи Nunjucks-темплейтов Eleventy превращает статьи в формате Markdown в HTML-страницы.

Проект собирается с помощью GitHub Actions и хостится на сервере, читайте [подробнее про деплой](./docs/deploy.md).

## Как работать

Для работы с платформой вам потребуется [Node.js](https://nodejs.org/en/) и npm.

Чтобы запустить Доку локально, нужно:

1. Скачать репозиторий.
1. Сделать копию файла `.env.example` и назвать его `.env`. Задать в нём нужные переменные окружения.
1. Установить зависимости командой `npm i`.
1. Запустить локальный веб-сервер командой `npm start`.

Больше вариантов локального запуска Доки — [в руководстве по запуску](docs/how-to-run.md).

---
Код распространяется [по лицензии MIT](LICENSE.md), шрифты имеют собственные лицензии, подробнее читайте [в документации](docs/license.md).
