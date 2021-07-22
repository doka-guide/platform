function getPersons(personKey) {
  return function(data) {
    const { doc } = data
    return doc.data[personKey]
  }
}

function getPopulatedPersons(personKey) {
  return function(data) {
    const { peopleById } = data.collections
    const personsIds = data[personKey] || []

    return personsIds.map(personId => peopleById[personId]
      ? peopleById[personId]
      : {
          data: {
            name: personId
          }
        }
    )
  }
}

module.exports = {
  layout: 'base.njk',

  bodyClass: 'aside-page',

  pagination: {
    data: 'collections.docs',
    size: 1,
    alias: 'doc'
  },

  permalink: '/{{doc.filePathStem}}.html',

  eleventyComputed: {
    title: function(data) {
      const { doc } = data
      return doc.data.title
    },

    authors: getPersons('authors'),

    populatedAuthors: getPopulatedPersons('authors'),

    contributors: getPersons('contributors'),

    populatedContributors: getPopulatedPersons('contributors'),

    editors: getPersons('editors'),

    populatedEditors: getPopulatedPersons('editors'),

    docPath: function(data) {
      return data.doc.filePathStem.replace('index', '')
    },

    practices: function(data) {
      const allPractices = data.collections.practice
      const { docPath } = data

      return allPractices.filter(practice => {
        return practice.filePathStem.includes(docPath)
      })
    },

    updatedAt: function(data) {
      const { doc } = data
      return doc.data.updatedAt ? new Date(doc.data.updatedAt) : null
    }
  }
}
