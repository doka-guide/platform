# Платформа Доки

[![Статус линтера](https://github.com/doka-guide/platform/actions/workflows/linting.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/linting.yml)
[![W3C Validator](https://github.com/doka-guide/platform/actions/workflows/w3c-validator.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/w3c-validator.yml)
[![Статус деплоя](https://github.com/doka-guide/platform/actions/workflows/product-deploy.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/product-deploy.yml)
[![Статус Docker](https://github.com/doka-guide/platform/actions/workflows/docker-deploy.yml/badge.svg?branch=main&event=push)](https://github.com/doka-guide/platform/actions/workflows/docker-deploy.yml)
[![Дискорд](https://img.shields.io/discord/1006904139969724436)](https://discord.gg/Ncpvbun2mr)


[⚠️ Если сайт Доки медленно загружается или не работает совсем](docs/load-fix.md)

Дока — это добрая энциклопедия для веб-разработчиков. Наша цель — сделать документацию по веб-разработке практичной, понятной и не унылой.

Вся актуальная информация по Доке обсуждается в [нашем сообществе в Дискорде](https://discord.gg/Ncpvbun2mr).

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

## Как запускать тесты

Мы используем [Jest](https://jestjs.io/docs/getting-started).
Добавьте свои тесты. Для этого добавьте файлы тестов в папку `__tests__`. Файл с тестом лучше называть также, как файл, который тестируется.

Запустите тесты командой `npm test`.
Чтобы запустить тесты в `watch` режиме, используйте дополнительный флаг `--watch`: `npm test -- --watch`.

## Как дебажить?

Запустите команду `npm run debug` и откройте в Chrome кладку `chrome:://inspect`.

Найдите нужную сессию в списке. Нажимайте `inspect` и запускайте отладку.

По-умолчанию отладчик сразу остановится. Чтобы добавить больше точек остановки добавьте в ваш код `debugger;` или найдите нужный файл и поставьте точку прямо в интерфейсе отладчика.
