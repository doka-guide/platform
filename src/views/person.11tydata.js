const { contentRepLink } = require('../../config/constants')

module.exports = {
  layout: 'base.njk',

  pagination: {
    data: 'collections.people',
    size: 1,
    alias: 'person',
  },

  permalink: '/people/{{ person.fileSlug }}/',

  categoryName: 'Участники',

  eleventyComputed: {
    personId: function (data) {
      const { person } = data
      return person.fileSlug
    },

    pageLink: function (data) {
      const { personId } = data
      return `/people/${personId}`
    },

    name: function (data) {
      const { person } = data
      return person.data.name
    },

    url: function (data) {
      const { person } = data
      return person.data.url
    },

    photo: function (data) {
      const { person } = data
      return person.data.photo
    },

    title: function (data) {
      return data.name
    },

    articlesIndex: function (data) {
      const { personId, docsByPerson } = data
      return docsByPerson[personId]
    },

    authorData: function (data) {
      const { peopleData, personId } = data

      if (!peopleData) {
        return null
      }

      return peopleData.find((person) => person.id === personId)
    },

    mostContributedCategory: function (data) {
      const { authorData } = data

      if (!authorData) {
        return null
      }

      return authorData?.mostContributedCategory
    },

    contributionStat: function (data) {
      const { authorData } = data

      if (!authorData) {
        return null
      }

      return authorData?.contributionStat
    },

    issuesLink: function (data) {
      const { personId } = data
      const pathname = contentRepLink + '/issues'
      const searchParams = new URLSearchParams({
        q: `is:issue author:${personId}`,
      })
      return pathname + '?' + searchParams
    },

    pullRequestsLink: function (data) {
      const { personId } = data
      const pathname = contentRepLink + '/pulls'
      const searchParams = new URLSearchParams({
        q: `is:pr author:${personId}`,
      })
      return pathname + '?' + searchParams
    },
  },
}
