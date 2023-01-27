const {
  articlePathsToObject,
  eleventyComputed: { answersByPerson, answersByQuestion },
} = require('../views.11tydata')

describe('articlePathsToObject', () => {
  it('returns an object with paths', () => {
    const paths = ['js/a', 'js/b']
    const collections = {
      js: [
        {
          filePathStem: '/js/a/index',
        },
        {
          filePathStem: '/js/b/index',
        },
      ],
    }

    const result = articlePathsToObject(paths, collections)

    expect(result).toEqual({
      js: [
        {
          filePathStem: '/js/a/index',
        },
        {
          filePathStem: '/js/b/index',
        },
      ],
    })
  })

  it('returns empty array in there is no correspondent articles', () => {
    const paths = ['js/fp']
    // there is no 'js/fp' in collection
    const collections = {
      js: [
        {
          filePathStem: '/js/a/index',
        },
        {
          filePathStem: '/js/b/index',
        },
      ],
    }

    const result = articlePathsToObject(paths, collections)
    expect(result.js.length).toEqual(0)
  })

  it('works if there is no such category in collection', () => {
    const paths = ['js/a', 'js/b', 'css/c']
    const collections = {
      js: [
        {
          filePathStem: '/js/a/index',
        },
      ],
    }

    const result = articlePathsToObject(paths, collections)

    expect(result).toEqual({
      js: [
        {
          filePathStem: '/js/a/index',
        },
      ],
    })
  })
})

describe('answersByQuestion', () => {
  it('returns an object with answers by question', () => {
    const collections = {
      js: [
        {
          filePathStem: '/js/js-a/index',
        },
        {
          filePathStem: '/js/js-b/index',
        },
      ],
      answer: [
        {
          filePathStem: '/interviews/nan/answers/hellsquirrel',
          fileSlug: 'hellsquirrel',
          data: {},
        },
      ],

      question: [
        {
          fileSlug: 'nan',
          data: {
            related: ['js/js-a', 'js/js-b'],
          },
        },
      ],
    }

    const result = answersByQuestion({ collections })
    expect(result).toEqual({
      nan: {
        hellsquirrel: {
          js: [
            {
              filePathStem: '/js/js-a/index',
            },
            {
              filePathStem: '/js/js-b/index',
            },
          ],
        },
      },
    })
  })

  it('returns empty object is there is no related articles', () => {
    const collections = {
      js: [
        {
          filePathStem: '/js/js-a/index',
        },
        {
          filePathStem: '/js/js-b/index',
        },
      ],
      answer: [
        {
          filePathStem: '/interviews/nan/answers/hellsquirrel',
          fileSlug: 'hellsquirrel',
          data: {},
        },
      ],

      question: [
        {
          fileSlug: 'nan',
          data: {
            related: [],
          },
        },
      ],
    }

    const result = answersByQuestion({ collections })
    expect(result).toEqual({ nan: { hellsquirrel: {} } })
  })
})

describe('answersByPerson', () => {
  it('returns an object with answers by person', () => {
    const collections = {
      answer: [
        {
          filePathStem: '/interviews/nan/answers/hellsquirrel',
          data: {
            included: ['js/js-a', 'js/js-b'],
          },
        },
      ],
    }

    const answersByQuestion = {
      nan: {
        hellsquirrel: {
          js: [
            {
              filePathStem: '/js/js-a/index',
            },
            { filePathStem: '/js/js-b/index' },
          ],
        },
      },
    }

    const result = answersByPerson({ answersByQuestion, collections })

    expect(result).toEqual({
      hellsquirrel: {
        js: [[{ filePathStem: '/js/js-a/index' }, { filePathStem: '/js/js-b/index' }]],
      },
    })
  })
})
