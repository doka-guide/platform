function getArticlesAs(personRole) {
  return function(data) {
    const { collections, personId } = data
    const { docs } = collections

    const emptyArray = []

    return docs
      .filter(doc => (doc.data?.[personRole] ?? emptyArray).includes(personId))
      .map(doc => transformArticlesData(doc))
  }
}

function transformArticlesData(article) {
  const section = article.filePathStem.split('/')[1]

  return {
    title: article.data.title,
    cover: article.data.cover,
    get imageLink() {
      return `${this.link}/${this.cover.mobile}`
    },
    description: article.data.description,
    link: `/${section}/${article.fileSlug}`,
    linkTitle: article.data.title.replace(/`/g, ''),
    section,
  }
}

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.people',
    size: 1,
    alias: 'person'
  },

  permalink: '/people/{{ person.fileSlug }}/',

  eleventyComputed: {
    personId: function(data) {
      const { person } = data
      return person.fileSlug
    },

    pageLink: function(data) {
      const { personId } = data
      return `/people/${personId}`
    },

    name: function(data) {
      const { person } = data
      return person.data.name
    },

    url: function(data) {
      const { person } = data
      return person.data.url
    },

    description: function(data) {
      const { person } = data
      return person.data.description
    },

    photo: function(data) {
      const { person } = data
      return person.data.photo
    },

    authorArticles: getArticlesAs('authors'),

    contributorArticles: getArticlesAs('contributors'),

    editorArticles: getArticlesAs('editors'),

    title: function(data) {
      return data.name
    },
  }
}
