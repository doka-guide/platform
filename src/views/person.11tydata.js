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

    photo: function(data) {
      const { person } = data
      return person.data.photo
    },

    title: function(data) {
      return data.name
    },

    articlesIndex: function(data) {
      const { personId, docsByPerson } = data
      return docsByPerson[personId]
    }
  }
}
