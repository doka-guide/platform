module.exports = {
  permalink: '/people/index.json',

  eleventyComputed: {
    json: function (data) {
      const { peopleData, collections } = data
      const people = collections.people

      for (const key in peopleData) {
        peopleData[key]['url'] = people.filter((person) => person.fileSlug === peopleData[key].id)[0].data.url
      }

      const buffer = {}
      buffer['images'] = []
      for (const key in peopleData) {
        buffer['images'].push(peopleData[key]['photoURL'])
      }
      buffer['images'] = buffer['images'].filter((img) => img !== null)

      buffer['links'] = []
      for (const key in peopleData) {
        buffer['links'].push(peopleData[key]['pageLink'])
      }

      return buffer
    },
  },
}
