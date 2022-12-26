const { articlePathsToObject } = require('../views.11tydata')

describe('articlePathsToObject', () => {
  test('returns an object with paths', () => {
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

  test('works is there is no such category in collection', () => {
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
