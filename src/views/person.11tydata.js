const { contentRepLink } = require('../../config/constants')

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.people',
    size: 1,
    alias: 'person'
  },

  permalink: '/people/{{ person.fileSlug }}/',

  categoryName: 'Авторы',

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
    },

    mostContributedCategory: function(data) {
      const { peopleData, name: personName } = data

      if (!peopleData) {
        return null
      }

      return peopleData
        .find(person => person.name === personName)
        ?.mostContributedCategory
    },

    issuesLink: function(data) {
      const { personId } = data
      const pathname = contentRepLink + '/issues'
      const searchParams = new URLSearchParams({
        q: `is:issue author:${personId}`
      })
      return pathname + '?' + searchParams
    },

    pullRequestsLink: function(data) {
      const { personId } = data
      const pathname = contentRepLink + '/pulls'
      const searchParams = new URLSearchParams({
        q: `is:pr author:${personId}`
      })
      return pathname + '?' + searchParams
    }
  }
}