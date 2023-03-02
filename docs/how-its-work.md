# Как работает Дока

## Репозитории

Дока живёт на гитхабе и работает на базе нескольких репозиториев:

- [Контент](https://github.com/doka-guide/content), в котором находятся все материалы;
- [Платформа](https://github.com/doka-guide/platform), в котором находится весь код сборки и клиентский код веб-приложения;
- [Бэкенд](https://github.com/doka-guide/api), в котором находится API Доки;
- [Поиск](https://github.com/doka-guide/search), в котором хранится API для организации поиска по контенту.

Авторы Доки в основном взаимодействуют с репозиторием **Контент**, в котором хранятся доки, статьи и практики для всех разделов, а также материалы из рубрики «На собеседовании».

**Платформа** основана на генераторе статических сайтов [11ty](https://www.11ty.dev). Страницы сайта свёрстаны в виде шаблонов в формате [Nunjucks](https://mozilla.github.io/nunjucks/).

**Бэкенд** — это REST API, который реализован на языке Go. API позволяет сохранять заполненные пользователями формы и реакции на статьи, а также является платформой для организации рассылок по электронной почте.

**Поиск** содержит движок, который позволяет искать по заранее подготовленному инвертированному индексу. Индекс формируется во время развёртывания сайта из основной ветки.

Репозитории Контент и Платформа используются для сборки статического сайта, Бэкенд и Поиск — для интерактивности сайта.

Все репозитории открытые, мы всегда ждём новых контрибьюторов. Работа в репозиториях организована по схеме GitHub Flow: есть основная ветка `main`, в которой хранится текущая версия продукта, и другие ветки с изменениями, которые проходят ревью в пулреквестах.

## Платформа

Для сборки сайта нужно подключать Контент. Это независимый репозиторий, который ничего «не знает» о Платформе. Платформа «знает» кое-что о Контенте: пути, список и цвета разделов, настройки материалов и структуру папок материалов.

Разделение контента и платформы на разные репозитории — это нестандартный способ работы с проектом на 11ty. При таком подходе мы лишаемся части стандартного функционала движка (например, автоматического обновления дат на основе истории git), но это позволяет:

- работать с материалами Доки напрямую без использования сборки (подразумевая, что весь стандартный синтаксис Markdown обрабатывается корректно на стороне платформы);
- развивать платформу независимо от материалов (например, не нужно ждать на каждой итерации сборки всего контента, достаточно работать с типовым материалом);
- создавать меньше шума для разработчиков и авторов в соответствующих репозитория;
- проводить тестирование сборки независимо;
- при сборках в контенте и платформе получать всегда актуальную версию контента и способа его представления;
- убирает необходимость поддержки необходимого окружения разработчика для авторов (то, как получилось можно посмотреть в превью, которое генерируется при каждом пуше на GitHub в пулреквесте).

### Константы и поведение по умолчанию

**Список переменных окружения**:

- `BASE_URL` — базовый адрес для сайта;
- `SECTIONS` — список основных разделов сайта;
- `PATH_TO_CONTENT` — путь до репозитория с контентом;
- `CONTENT_REP_FOLDERS` — папки с содержимым разделов и служебной информацией для сборки;
- `DOKA_ORG` — путь до организации на GitHub;
- `PLATFORM_REP_GITHUB_URL` — путь до репозитория с платформой на GitHub;
- `CONTENT_REP_GITHUB_URL` — путь до репозитория с контентом на GitHub;
- `CONTENT_REP_GITHUB` — ссылка до репозитория с контентом на GitHub для работы с Git;
- `SERVER_PATH` — абсолютный путь до папки на сервере с текущей сборкой;
- `GITHUB_TOKEN` — токен для работы с GraphQL API GitHub. [Инструкция по генерации персонального токена](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).

Папка _settings_ из списка `CONTENT_REP_FOLDERS` является обязательной для сборки. Если оставить поле `GITHUB_TOKEN` пустым, на страницах участников не будет отображаться информация об их активности на GitHub в репозитории с контентом.

Список разделов Доки, которые попадают в сборку сайта, задаётся переменной `SECTIONS` в файлах [_.env.example_](https://github.com/doka-guide/platform/blob/main/.env.example), где задаются переменные окружения (подробнее об обязательной настройке перед запуском [в документации](https://github.com/doka-guide/platform/blob/main/docs/how-to-run.md)), и [_constants.js_](https://github.com/doka-guide/platform/blob/main/config/constants.js), в котором указываются значения по умолчанию, если они не заданы в файле с переменными окружения. Папки с материалами разделов могут быть пустыми или вообще отсутствовать. Сборка будет учитывать только те материалы, которые есть в указанных папках. Структура папок с материалами должна быть следующей:

```bash
section                         # Папка раздела
  └── doka-or-article           # Папка для материала
      ├── demos                 # Папка для демок
      │    └── first-demo       # Папка демки
      │         └── index.html  # Страница с демкой (загружается в <iframe>)
      ├── images                # Папка для картинок
      │    └── picture.png      # Файлы картинок
      ├── practice              # Папка для рубрики «На практике»
      │    └── author.md        # Текст для раздела «На практике» от конкретного автора
      └── index.md              # Текст материала (дока / статья)
```

Цвета разделов определяются в файлах:
- [_category-colors.js_](https://github.com/doka-guide/platform/blob/main/config/category-colors.js);
- [_base-colors.css_](https://github.com/doka-guide/platform/blob/main/src/styles/base-colors.css) — базовые цвета;
- [_light-theme.css_](https://github.com/doka-guide/platform/blob/main/src/styles/light-theme.css) — для светлой темы;
- [_dark-theme.css_](https://github.com/doka-guide/platform/blob/main/src/styles/dark-theme.css) — для тёмной темы.

#### Пути

Сайт формируется из двух репозиториев для Платформы, поэтому нужно подготовить набор путей с материалами Контента перед сборкой. Для этого выполняется скрипт [_make-links.js_](https://github.com/doka-guide/platform/blob/main/make-links.js) в одном из двух режимов: локально для пользователей — в интерактивном, на сервере — в режиме развёртывания. По умолчанию папки из Контента встраиваются с помощью ссылок в папку _src/_.

Структура папок Платформы:

```bash
platform
  ├── .github         # Служебная папка для GitHub
  ├── config          # Папка с файлами конфигурации
  ├── docs            # Документация Платформы Доки
  └── src             # Исходный код для сборки
      ├── data        # Папка с подключением данных (сущность 11ty)
      ├── fonts       # Папка с подготовленными шрифтами
      ├── images      # Папка с иконками и неконтентными картинками сайта
      ├── includes    # Папка с шаблонами некоторых блоков
      ├── layouts     # Папка с основой разметки страниц
      ├── libs        # Папка с библиотеками для сборки
      ├── scripts     # Папка со скриптами для сборки и клиента
      ├── styles      # Стили сайта
      ├── transforms  # Трансформации (сущность 11ty)
      └── views       # Представления основных страниц сайта
```

#### Сборка сайта

_.eleventy.js_ — основной файл для сборки. В нём прописана конфигурация движка 11ty.

Сущности 11ty:

- контент — тексты на сайте (в Доке файлы с контентом хранятся в подпапках папки _src_ с расширениями _*.md_ и _*.html_) и различные медиафайлы;
- шаблоны — основной способ для формирования разметки (в Доке это файлы с разметкой страниц или блоков страниц с расширениями _*.njk_);
- данные — заранее записанные или специально подготовленные с помощью JavaScript данные, которые нужны для сборки (в Доке это файлы с расширениями _*.11tydata.js_);
- коллекции — специальный объект движка, в котором могут хранится специально подготовленные данные (в Доке коллекции задаются в основном файле конфигурации);
- трансформации — процесс обработки уже готовых страниц сайта;
- пермалинки — постоянные адреса для страниц, которые отличаются от установленных 11ty и указываются пользователем вручную. Они используются для обеспечения гибкости движка по отношению к пути хранения файла с контентом.

Сборка сайта осуществляется в следующем порядке:

1. Поиск файлов с вёрсткой (шаблонов) и контентом в репозитории по указанным путям.
2. Проход по всем найденным файлам:
   - Формирование списка всех файлов, которые не являются файлами с контентом (в Доке это шрифты, стили, клиентские скрипты, иконки, фото, видео и пр.).
   - Предварительная обработка шаблонов и подготовка контента для шаблонов.
3. Асинхронное копирование всех файлов, которые не являются файлами с контентом. Копирование проходит параллельно предварительным стадиям.
4. Формирование данных и вычисляемых значений для сборки (для заполнения готовых шаблонов контентом).
5. Построение графа зависимостей в следующем порядке:
   - обработка шаблонов, которые не содержат зависимостей;
   - обработка шаблонов, которые используют теги (встроенное поле в мете файлов с контентом);
   - обработка шаблонов, которые используют пагинацию и любые другие коллекции;
   - обработка шаблонов, которые используют пагинацию и Configuration API для добавления коллекций;
   - обработка шаблонов, которые используют пагинацию и готовят локальные объекты с коллекциями `collection`;
   - обработка шаблонов, которые используют пагинацию и готовят глобальный объект с коллекциями `collection.all`.
6. Формирование коллекций в правильном порядке для графа зависимостей.
7. Формирование дополнительного графа зависимостей для формирования вычисляемых данных, пермалинков и путей исходных файлов с контентом.
8. Обработка шаблонов без формирования разметки страниц.
9. Проверка на дубликаты.
10. Обработка шаблонов с окончательной разметкой страниц.
11. Применение трансформаций.

В файле конфигурации настраиваются папки, в которых хранятся разные типы сущностей. В Доке папки используются следующим образом:

- _dist/_ — для собранного сайта;
- _src/_ — для исходного кода сайта;
- _src/data/_ — для глобальных данных сайта;
- _src/includes/_ — для разметки блоков страниц;
- _src/layouts/_ — для основной разметки страниц.

В качестве основной библиотеки для обработки файлов с контентом используется библиотека `markdown-it`. Однако, по умолчанию библиотека обрабатывает видео не так, как это нужно в Доке. Поэтому используется [собственное решение](https://github.com/doka-guide/platform/blob/main/src/markdown-it.js).

Особое внимание при сборке сайта Доки уделяется трансформациям, то есть постобработке готовой разметки страниц. Используются следующие трансформации:

1. `answers-link-transform` — правит пути к демкам и картинкам, которые вставлены в раздел «На практике».
1. `article-code-blocks-transform` — формирует разметку для блоков с кодом в тексте материалов с возможностью копирования.
1. `article-inline-code-transform` — формирует разметку для кода в тексте материалов с возможностью копирования.
1. `callout-transform` — формирует разметку для коллаутов.
1. `code-breakify-transform` — расставляет переносы в тексте для кода.
1. `code-classes-transform` — расставляет классы на инлайновые блоки с кодом.
1. `color-picker-transform` — добавляет квадратики с цветом в коде после упоминания.
1. `demo-external-link-transform` — добавляет ссылки для открытия демок в новом окне.
1. `demo-link-transform` — правит пути к демкам и картинкам, которые вставлены в раздел «На практике».
1. `details-transform` — оборачивает содержимое `<details>` в блоки с классом `.content`.
1. `headings-anchor-transform` — генерирует якорные ссылки на заголовки.
1. `headings-id-transform` — генерирует разметку для формирования атрибутов `id` заголовков.
1. `iframe-attr-transform` — добавляет атрибуты к `<iframe>`, если их нет.
1. `image-place-transform` — помещает изображения с подписями внутрь `<figure>`.
1. `image-transform` — готовит картинки в разных форматах для оптимизации загрузки страниц.
1. `link-transform` — добавляет классы к ссылкам.
1. `table-transform` — оборачивает таблицы в контейнеры с прокруткой.
1. `toc-transform` — генерирует оглавление страницы.

#### Тесты

В Доке используем модульное тестирование с помощью фреймворка [Jest](https://jestjs.io). Его конфигурация находится в файлах [_jest.config.js_](https://github.com/doka-guide/platform/blob/main/jest.config.js) и [_jest.setup.js_](https://github.com/doka-guide/platform/blob/main/jest.setup.js). Сами тесты — в подпапке *__tests__/* папок со скриптами.

#### Скрипты запуска

Для работы платформы можно использовать разные режимы (описаны в файле [_package.json_](https://github.com/doka-guide/platform/blob/main/package.json)):

- `debug` — для отладки платформы и контента (сайт не падает, если что-то пошло не так, а информирует о том, что случилось);
- `start` — для запуска платформы локально с автоматической перезагрузкой при изменении файлов контента или платформы;
- `build` — для сборки сайта (с минификацей кода и всеми трансформациями);
- `preview` — для предварительного просмотра сборки (без минификации кода и всеми трансформациями кроме `image-transform`);
- `deploy` — для развёртывания сайта на инфраструктуре Доки (при наличии доступа);
- `editorconfig` — для проверки файлов на требования Editorconfig, согласно [конфигурации](https://github.com/doka-guide/platform/blob/main/.editorconfig);
- `stylelint` — для проверки файлов на требования Stylelint, согласно [конфигурации](https://github.com/doka-guide/platform/blob/main/.stylelintrc.json);
- `eslint` — для проверки файлов на требования ESLint, согласно [конфигурации](https://github.com/doka-guide/platform/blob/main/.eslintrc.json);
- `lint-check` — запуск всех линтеров;
- `test` — запуск модульных тестов;
- `make-links` — для формирования символьных ссылок на контент.

#### Шаблоны

Шаблоны в Доке реализованы с помощью [Nunjucks](https://mozilla.github.io/nunjucks/). В папке _src/layouts_ содержится один базовый шаблон _base.njk_ с основной разметкой любой страницы на сайте. В нём формируются основные теги `<html>`, `<head>` и `<body>`, подключается микроразметка и метатеги с помощью _meta.njk_, к странице подключаются стили и скрипты клиентского кода.

Шаблоны страниц сайта находятся в папке _src/views_:

- _[404.njk](https://github.com/doka-guide/platform/blob/main/src/views/404.njk)_ — страница, которая показывается, если по указанному адресу страницы нет;
- _[all.njk](https://github.com/doka-guide/platform/blob/main/src/views/all.njk)_ — страница с индексом по всем материалам (докам, статьям);
- _[article-index.njk](https://github.com/doka-guide/platform/blob/main/src/views/article-index.njk)_ — страницы с индексом материалов по каждому разделу;
- _[doc.njk](https://github.com/doka-guide/platform/blob/main/src/views/doc.njk)_ — страницы с материалами;
- _[feed.njk](https://github.com/doka-guide/platform/blob/main/src/views/feed.njk)_ — XML-документ для организации фида для RSS;
- _[index.njk](https://github.com/doka-guide/platform/blob/main/src/views/index.njk)_ — главная страница сайта;
- _[page.njk](https://github.com/doka-guide/platform/blob/main/src/views/page.njk)_ — страницы с текстами, которые не являются материалами;
- _[people.njk](https://github.com/doka-guide/platform/blob/main/src/views/people.njk)_ — страница со списком участников (контрибьюторов);
- _[person-json.njk](https://github.com/doka-guide/platform/blob/main/src/views/person-json.njk)_ — информация об участнике проекта в формате JSON;
- _[person.njk](https://github.com/doka-guide/platform/blob/main/src/views/person.njk)_ — персональные страницы участников;
- _[sc-index.njk](https://github.com/doka-guide/platform/blob/main/src/views/sc-index.njk)_ — карточки для социальных сетей (нужны для формирования картинки для социальных сетей) в формате HTML для разделов;
- _[sc.njk](https://github.com/doka-guide/platform/blob/main/src/views/sc.njk)_ — карточки для социальных сетей (нужны для формирования картинки для социальных сетей) в формате HTML для материалов;
- _[search.njk](https://github.com/doka-guide/platform/blob/main/src/views/search.njk)_ — страница поиска;
- _[sitemap.njk](https://github.com/doka-guide/platform/blob/main/src/views/sitemap.njk)_ — XML-документ с картой сайта;
- _[specials.njk](https://github.com/doka-guide/platform/blob/main/src/views/specials.njk)_ — страницы специальных проектов;
- _[subscribe.njk](https://github.com/doka-guide/platform/blob/main/src/views/subscribe.njk)_ — страница для управления подпиской на рассылку по электронной почте.

Шаблоны отдельных блоков страниц находятся в папке _src/includes_:

- _[analytics/google.njk](https://github.com/doka-guide/platform/blob/main/src/includes/analytics/google.njk)_ — подключение Google Analytics на сайт;
- _[analytics/metrika.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/article-image.njk)_ — подключение Яндекс.Метрики на сайт;
- _[blocks/article-image.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/article-image.njk)_ — иллюстрации материалов;
- ~~_[blocks/aside.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/aside.njk)_ — вёрстка страниц с боковой навигацией (пока не используется)~~;
- _[blocks/cookie-notification.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/cookie-notification.njk)_ — попап с информацией об использовании кук;
- _[blocks/featured-article.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/featured-article.njk)_ — блок показа одного материала для фичеринга на главной странице сайта;
- _[blocks/footer.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/footer.njk)_ — футер сайта (переключатель темы, вторичное меню);
- _[blocks/header.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/header.njk)_ — шапка сайта (лого, хлебные крошки, поиск, основное меню);
- _[blocks/linked-article.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/linked-article.njk)_ — кнопки для перехода на предыдущий или следующий материал раздела;
- _[blocks/logo.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/logo.njk)_ — вёрстка для логотипа;
- _[blocks/nav-list.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/nav-list.njk)_ — меню со списком разделов сайта;
- _[blocks/person-avatar.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/person-avatar.njk)_ — аватар участника;
- _[blocks/person-badges.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/person-badges.njk)_ — набор значков участника;
- _[blocks/person.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/person.njk)_ — представление краткой информации об участнике на странице со списком участников;
- _[blocks/search-category.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/search-category.njk)_ — фильтр по категориям для страницы поиска;
- _[blocks/search-hits.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/search-hits.njk)_ — один результат поиска с краткой информацией о материале;
- _[blocks/search-tags.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/search-tags.njk)_ — фильтр по типу материала для страницы поиска;
- _[blocks/search.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/search.njk)_ — блок поиска в основном меню;
- _[blocks/snow-toggle.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/snow-toggle.njk)_ — переключатель для падающего снега (запускается в новогодние праздники);
- _[blocks/snow.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/snow.njk)_ — блок, реализующий падающий снег (запускается в новогодние праздники);
- _[blocks/social-card.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/social-card.njk)_ — карточка для социальных сетей;
- _[blocks/theme-toggle.njk](https://github.com/doka-guide/platform/blob/main/src/includes/blocks/theme-toggle.njk)_ — переключатель темы на сайте;
- _[articles-gallery.njk](https://github.com/doka-guide/platform/blob/main/src/includes/articles-gallery.njk)_ — блок со всеми материалами на главной странице, которые были выбраны для фичеринга (список материалов обновляется каждую неделю);
- _[contributors.njk](https://github.com/doka-guide/platform/blob/main/src/includes/contributors.njk)_ — блок для материалов, в котором показаны все участники;
- _[feedback-form.njk](https://github.com/doka-guide/platform/blob/main/src/includes/feedback-form.njk)_ — форма для отправки обратной связи для материалов;
- _[meta.njk](https://github.com/doka-guide/platform/blob/main/src/includes/meta.njk)_ — подключение иконок, манифеста, шрифтов и стилей, настройки доступных тем, формирование метатегов и микроразметки страниц;
- _[practices.njk](https://github.com/doka-guide/platform/blob/main/src/includes/practices.njk)_ — блок рубрики «На практике» в материалах;
- _[questions.njk](https://github.com/doka-guide/platform/blob/main/src/includes/questions.njk)_ — блок рубрики «На собеседовании» в материалах;
- _[related-articles-gallery.njk](https://github.com/doka-guide/platform/blob/main/src/includes/related-articles-gallery.njk)_ — блок для представления связанных док и статей с текущим материалом;
- _[subscribe-popup.njk](https://github.com/doka-guide/platform/blob/main/src/includes/subscribe-popup.njk)_ — попап для отправки электронной почты, чтобы подписаться на рассылку.
