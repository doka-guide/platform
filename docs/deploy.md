# Деплой Доки

Дока хостится на [Netlify](https://www.netlify.com/) как набор статических файлов.

## Когда деплоим

Автоматически, при слиянии пулреквеста в ветку `main` в репозитории `content` или `platform`.

## Как собираем

Проект собирается с помощью GitHub Actions.

В каждом репозитории описан свой workflow для сборки, но они идентичны по содержанию:
* [workflow в `content`](https://github.com/Y-Doka/content/blob/main/.github/workflows/netlify-deploy.yml)
* [workflow в `platform`](https://github.com/Y-Doka/platform/blob/main/.github/workflows/netlify-deploy.yml)

Сборка состоит из пяти этапов:
1. Скачать свежие версии репозиториев `content` и `platform`
1. Установить зависимости
1. Подключить статьи к платформе
1. Собрать проект
1. Отправить папку со сборкой в Netlify

На стороне Netlify не происходит никаких действий, кроме публикации переданной папки со сборкой.
