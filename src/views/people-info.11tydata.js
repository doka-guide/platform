module.exports = {
  permalink: '/people/info.json',

  eleventyComputed: {
    json: function (data) {
      const { peopleData, collections } = data
      const people = collections.people

      for (const key in peopleData) {
        peopleData[key]['url'] = people.filter((person) => person.fileSlug === peopleData[key].id)[0].data.url
      }
      return peopleData
    },
  },
}
