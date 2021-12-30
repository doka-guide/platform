function isExternalURL(url) {
  return url.startsWith('http://')
    || url.startsWith('https://')
    || url.startsWith('//')
}

module.exports = {
  layout: 'base.njk',

  title: 'Авторы',

  permalink: '/people/',

  eleventyComputed: {
    peopleData: function(data) {
      const { collections } = data
      const { people, docsByPerson } = collections

      return people
        .filter(person => {
          const personId = person.fileSlug
          return !!docsByPerson[personId]
        })
        .map(person => {
          const personId = person.fileSlug
          const personData = docsByPerson[personId]
          const { name, photo } = person.data

          const photoURL = photo
            ? isExternalURL(photo)
              ? photo
              : `/people/${photo}/`
            : null

          const pageLink = `/people/${personId}/`

          const statEntries = Object.entries(personData)
            .map(([category, articlesByRole]) => [
              category,
              Object.values(articlesByRole).reduce((acc, articles) => {
                acc += articles.length
                return acc
              }, 0)
            ])

          const mostContribution = statEntries
            .reduce((acc, currentItem) => {
              return currentItem[1] > acc[1] ? currentItem : acc
            })

          let [mostContributedCategory, mostContributedCount] = mostContribution

          // если пользователь сделал вклад по одной статье в нескольких категориях, то оценить наибольший вклад сложно, поэтому присваиваем `null`, чтобы в UI можно было сделать альтернативное нейтральное отображение
          mostContributedCategory = (mostContributedCount === 1 && statEntries.length > 1)
            ? null
            : mostContributedCategory

          const totalArticles = statEntries
            .reduce((acc, currentItem) => {
              acc += currentItem[1]
              return acc
            }, 0)

          const stat = Object.fromEntries(statEntries)

          return {
            name,
            photoURL,
            pageLink,
            stat,
            mostContributedCategory,
            totalArticles
          }
        })
        .sort((person1, person2) => person2.totalArticles - person1.totalArticles)
    }
  }
}
