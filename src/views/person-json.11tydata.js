const { contentRepLink } = require('../../config/constants')
const { getBadge } = require('../libs/badge-constructor/badge-constructor')
const { getRole } = require('../libs/role-constructor/role-constructor')

module.exports = {
  pagination: {
    data: 'collections.people',
    size: 1,
    alias: 'person',
  },

  permalink: '/people/{{ person.fileSlug }}/info.json',

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

    contributionStat: function (data) {
      const { authorData } = data

      if (!authorData) {
        return null
      }

      return authorData?.contributionStat
    },

    badges: function (data) {
      const { person } = data
      return person.data.badges?.map(getBadge)
    },

    roles: function (data) {
      const { person } = data
      return person.data.roles?.map(getRole)
    },

    practicesIndex: function (data) {
      const { personId, practicesByPerson } = data
      const output = {}
      for (const category in practicesByPerson[personId]) {
        output[category] = []
        for (const article in practicesByPerson[personId][category]) {
          output[category].push({
            title: practicesByPerson[personId][category][article].data.title,
            description: practicesByPerson[personId][category][article].data.description,
            url: practicesByPerson[personId][category][article].filePathStem.replace(/\/index$/, ''),
          })
        }
      }
      return output
    },

    articlesIndex: function (data) {
      const { personId, docsByPerson } = data
      const output = {}
      for (const category in docsByPerson[personId]) {
        output[category] = {}
        for (const role in docsByPerson[personId][category]) {
          output[category][role] = []
          for (const article in docsByPerson[personId][category][role]) {
            output[category][role].push({
              title: docsByPerson[personId][category][role][article].data.title,
              description: docsByPerson[personId][category][role][article].data.description,
              url: docsByPerson[personId][category][role][article].filePathStem.replace(/\/index$/, ''),
            })
          }
        }
      }
      return output
    },

    authorData: function (data) {
      const { peopleData, personId } = data

      if (!peopleData) {
        return null
      }

      return peopleData.find((person) => person.id === personId)
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

    json: function (data) {
      const {
        pageLink,
        name,
        url,
        contributionStat,
        badges,
        roles,
        practicesIndex,
        articlesIndex,
        issuesLink,
        pullRequestsLink,
      } = data
      return {
        pageLink,
        name,
        url,
        contributionStat,
        badges,
        roles,
        practicesIndex,
        articlesIndex,
        issuesLink,
        pullRequestsLink,
      }
    },
  },
}
