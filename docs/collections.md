# Организация контента

В этом документе рассказывается о том, как организовать контент на сайте, чтобы у вас появилось оглавление.

## Как создать коллекции

1. Войдите в файл `.eleventy.js` в корне проекта. Там вы увидите следующую конструкцию:

    ```js
    module.exports = function(config) {
      const articleSections = ['html', 'css', 'js', 'tools']

      // Add all Tags
      articleSections.forEach((el) => {
        let elArticles = el + 'Articles'
        let elDoka = el + 'Doka'

        config.addCollection(el, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/**`)
        })

        config.addCollection(elArticles, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/articles/**`)
        })

        config.addCollection(elDoka, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/doka/**`)
        })
      })

      // Далее оставшийся код
    ```

    Дока, по-умолчанию, состоит из любого количества разделов, которые хранятся [в отдельном контентном репозитории](https://github.com/Y-Doka/content).

    Например, у это могут быть разделы: [HTML](https://github.com/Y-Doka/content/tree/master/html), [CSS](https://github.com/Y-Doka/content/tree/master/css), [JS](https://github.com/Y-Doka/content/tree/master/js) и [TOOLS](https://github.com/Y-Doka/content/tree/master/tools). Как видите, каждый из этих разделов — отдельная папка с контентом.

    Так же Дока состоит из двух типов контента: Статей и Док.

    **Дока** — это справочный материал, кратко и формально описывающий некое понятие, например, свойство или тег. Как спецификация, только по-русски и понятным языком. Такие статьи лежат в папках внутри директории `/doka` в родительском разделе.

    **Статья** — это расширенный материал, посвящённый определённому вопросу, с авторским мнением, примерами и рассуждениями. Директория таких материалов — `/articles`

1. Укажите свой список директорий в массиве ([что такое массив?](https://y-doka.site/js/doka/arrays/)) через запятую по аналогии.

    Например, вы делаете энциклопедию про космические аппараты, которые вращаются вокруг Земли. У вас в контентном репозитории есть всего две папки: `/satellite` и `/spaceStation`. Так и запишем:

    ```js
    // Было
    const articleSections = ['html', 'css', 'js', 'tools']

    // Стало
    const articleSections = ['satellite', 'spaceStation']
    ```

    Теперь у вас есть теги: `satellite` и `spaceStation` — вы можете их вызывать и использовать.

1. Решите, сколько подтипов статей у вас будет? Один? Два, как у нас? Три? Давайте создадим столько, сколько понадобится:

    1. У вас блог с одним типом статей.

        **Это необязательный пункт**

        Найдите в файле `.eleventy.js` строки

        ```js
        let elArticles = el + 'Articles'
        let elDoka = el + 'Doka'
        ```

        и

        ```js
        config.addCollection(elArticles, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/articles/**`)
        })

        config.addCollection(elDoka, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/doka/**`)
        })
        ```

        и смело удалите их.

        Это можно не делать, на работу сайта это почти не повлияют, просто у вас появятся дополнительные неработающие коллекции.

    1. У вас сайт с двумя типами статей.

        Если материалы делятся, как у нас, на **Доки** и **Статьи**, вы можете пользоваться тем, что у вас есть сейчас.

        Если нет, найдите строки ниже и замените слова `Articles` и `Doka` на то, что вы используете в проекте. Главное — чтобы в функциях, которые собирают коллекции, были правильно указаны пути. Например, у вас есть статьи типа `Исторические` и `Актуальные` и в папках тоже есть такое разделение: `history` и `current` — соответственно.

        Так и запишем.

        Найдите в файле `.eleventy.js` строки

        ```js
        // Было
        let elArticles = el + 'Articles'
        let elDoka = el + 'Doka'

        // Стало
        let elHistory = el + 'History'
        let elCurrent = el + 'Current'
        ```

        и

        ```js
        // Было
        config.addCollection(elArticles, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/articles/**`)
        })

        config.addCollection(elDoka, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/doka/**`)
        })

        // Стало
        config.addCollection(elHistory, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/history/**`)
        })

        config.addCollection(elCurrent, function(collectionApi) {
          return collectionApi.getFilteredByGlob(`src/${el}/current/**`)
        })
        ```

        Теперь у вас есть много тегов: `satelliteHistory` и `spaceStationHistory` плюс `satelliteCurrent` и `spaceStationCurrent`

    1. Если вам нужно больше вариантов, просто добавьте новую константу, которая определит подтип и ещё одну функцию, которая соберёт коллекции по аналогии с пунктом выше.

    Более подробно можно почитать в официальной документации разработчика eleventy [на английском языке](https://www.11ty.dev/docs/collections/).

## Как выводить коллекции

По-умолчанию, у нас есть два места, куда могут выводиться коллекции: на страницу-оглавление и в боковую панель. Вам стоит понять общий принцип организации и вы сможете легко сделать свои подборки статей.

Найдите папку `includes/collections`. Там вы увидите наши пересеты.

Можно сделать по аналогии и мы рассмотрим этот вариант на примере одной из коллекций.

Возьмём файл cssArticlesList.njk:

```js
{% if collections.cssArticles | length %}
{% if page.url === '/all/'%}
<h3>Статьи</h3>
{% endif %}
<ul>
  {% for post in collections.cssArticles %}
    {% if post.data.title %}
    <li><a href="{{ post.url }}">{{ post.data.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
{% endif %}
```

Ваши теги для коллекций мы создавали чуть выше. Например, если вы делаете энциклопедию про космические корабли, на месте `cssArticles` у вас могло бы быть `satelliteHistory`.

Читаем и комментируем:

```js
// Если у вас есть коллекция cssArticles
{% if collections.cssArticles | length %}

// Если страница, где будет выводиться весь контент — это /all (оглавление)
{% if page.url === '/all/'%}

// Вставляем заголовок. Вы можете его изменить или удалить этот блок с «если», если он вам не нужен
<h3>Статьи</h3>

// Закрываем «если» для страницы
{% endif %}

// Создаём список
<ul>

  // Начисляем перечислять все элементы из коллекции
  {% for post in collections.cssArticles %}
    // Если у поста есть заголовок
    {% if post.data.title %}

    // Создаём элемент списка
    <li>
      // Тут сами подставятся ссылка на статью и её заголовок
      <a href="{{ post.url }}">{{ post.data.title }}</a></li>

    // Закрываем «если» для заголовка
    {% endif %}

  // Закрываем перечисление
  {% endfor %}
</ul>

// Закрываем «если» для проверки тега
{% endif %}
```

Теперь ваш сайт вначале проверит, есть ли у вас посты в нужной коллекции. Если есть, создаст список и выведет его. Мы предусмотрели возможность вывода в подборку ссылок без текста, поэтому включили такое исключение по заголовкам.

Кстати, код, который мы сейчас правили — это не классический HTML, а расширение для JavaScript, который называется Nunjucks и разрабатывается Mozilla Foundation. Такие файлы имеют расширение `*.njk`.

Почитайте документацию [на английском языке](https://mozilla.github.io/nunjucks/api.html), чтобы узнать больше.

## Как добавить подборку на страницу

Продолжим знакомиться с Nunjucks и вставим в нужное место необходимый «инклюд». Например:

```js
{% include "collections/cssArticlesList.njk" %}
```

Это не `<iframe>...</iframe>` ([Что за iframe?](https://y-doka.site/html/doka/iframe/)), а подстановка содержимого одного файла в нужное место в другом. Чистый код, ничего больше.

**Обратите внимание**, вам нужно указать относительный путь к вставляемому файлу, начиная с папки `src/includes`. Всё, что можно вставлять, лежит именно там, движок это знает, поэтому удлиннять путь не требуется.

Если вам нужно выводить этот список только на определённой старанице или только, если такие статьи существуют, оберните этот код в соответсвующий «если»:

```js
// Если страница, где будет выводиться весь контент — это /all (оглавление)
{% if page.url === '/all/'%}
  {% include "collections/cssArticlesList.njk" %}
{% endif %}

// Если страница, где НЕ будет выводиться весь контент — это /all (оглавление), а на других должно отображаться
{% if page.url !=== '/all/'%}
  {% include "collections/cssArticlesList.njk" %}
{% endif %}

// Если у вас есть коллекция css
// Условия могут зависеть от любой из вашиъх коллекций или других параметров
{% if collections.css | length %}
```

## Вместо заключения

Теперь вы больше знаете о работе нашей платформы и о том, как создавать коллекции.

Со временем мы постараемся автоматизировать этот процесс, чтобы все, кто не связан с веб-разработкой, мог пользоваться нашим инструментом. А пока, если вы не разобрались, [создайте issue в нашем репозитории](https://github.com/Y-Doka/platform/issues) или напишите нам на почту [feedback@y-doka.site](mailto:feedback@y-doka.site), мы постараемся вам помочь.
