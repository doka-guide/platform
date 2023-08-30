const { contentRepLink } = require('../../config/constants')
const { getBadge } = require('../libs/badge-constructor/badge-constructor')
const { getRole } = require('../libs/role-constructor/role-constructor')

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

    behanceId: function (data) {
      const { person } = data
      const pattern = new RegExp('^(http|https)://(www.)?behance.net/')
      return person.data.url.replace(pattern, '')
    },

    twitterId: function (data) {
      const { person } = data
      const pattern = new RegExp('^(http|https)://(www.)?twitter.com/')
      return person.data.url.replace(pattern, '')
    },

    telegramId: function (data) {
      const { person } = data
      const pattern = new RegExp('^(http|https)://(www.)?t.me/')
      return person.data.url.replace(pattern, '')
    },

    badges: function (data) {
      const { person } = data
      return person.data.badges?.map(getBadge)
    },

    roles: function (data) {
      const { person } = data
      return person.data.roles?.map(getRole)
    },

    photo: function (data) {
      const { person } = data
      return person.data.photo
    },

    photoAlt: function (data) {
      const { person } = data
      return person.data.photoAlt
    },

    title: function (data) {
      return data.name
    },

    practicesPersonRole: function () {
      return 'Автор совета'
    },

    practicesIndex: function (data) {
      const { personId, practicesByPerson } = data
      return practicesByPerson[personId]
    },

    answersPersonRole: function () {
      return 'Автор ответа'
    },

    answersInArticles: function (data) {
      const { personId, answersByPerson } = data
      return answersByPerson[personId]
    },

    categoriesOnlyWithPractice: function (data) {
      const { personId, practicesByPerson, docsByPerson } = data
      if (docsByPerson[personId] && practicesByPerson[personId]) {
        const docsCategories = Object.keys(docsByPerson[personId])
        const answersCategories = Object.keys(practicesByPerson[personId])
        return answersCategories.filter((a) => !docsCategories.includes(a))
      } else if (!docsByPerson[personId] && practicesByPerson[personId]) {
        return Object.keys(practicesByPerson[personId])
      } else {
        return false
      }
    },

    isOnlyWithPractice: function (data) {
      const { categoriesOnlyWithPractice } = data
      return !!categoriesOnlyWithPractice
    },

    categoriesOnlyWithAnswers: function (data) {
      const { personId, answersByPerson, docsByPerson } = data
      if (docsByPerson[personId] && answersByPerson[personId]) {
        const docsCategories = Object.keys(docsByPerson[personId])
        const answersCategories = Object.keys(answersByPerson[personId])
        return answersCategories.filter((a) => !docsCategories.includes(a))
      } else if (!docsByPerson[personId] && answersByPerson[personId]) {
        return Object.keys(answersByPerson[personId])
      } else {
        return false
      }
    },

    isOnlyWithAnswer: function (data) {
      const { categoriesOnlyWithAnswers } = data
      return !!categoriesOnlyWithAnswers
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

    badgesFields: function (data) {
      const { authorData } = data

      if (!authorData) {
        return null
      }

      const nodes = authorData?.contributionActions?.people?.target?.history?.nodes
      // TODO: Решить вопрос с датой для участников: Игорь Коровченко, Ольга Алексашенко
      const githubFirstContribution = new Date(
        nodes && nodes.length > 0 ? nodes[nodes.length - 1]?.pushedDate : '2021-10-12T00:00:00Z'
      )
        .toLocaleString('ru', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        .replace(' г.', '')

      return {
        githubFirstContribution,
      }
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
