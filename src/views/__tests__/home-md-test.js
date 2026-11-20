const homeMd = require('../home-md.11tydata')
const { baseUrl } = require('../../../config/constants')

const collections = {
  articleIndexes: [{ fileSlug: 'css', data: { name: 'CSS' } }],
  docs: [{ fileSlug: 'display', filePathStem: '/css/display/index', data: { title: 'display', tags: ['doka'] } }],
}

const render = (data) => homeMd.eleventyComputed.markdown(data)

describe('index.md: markdown-версия главной', () => {
  it('лежит рядом с главной', () => {
    expect(homeMd.permalink).toBe('/index.md')
  })

  it('начинается с фронтматтера с названием, описанием и адресом', () => {
    const [, frontMatter] = render({ collections }).split('---\n')

    expect(frontMatter).toContain('title: "Дока"')
    expect(frontMatter).toMatch(/^description: ".+"$/m)
    expect(frontMatter).toContain(`url: "${baseUrl}/"`)
  })

  it('после фронтматтера повторяет llms.txt', () => {
    expect(render({ collections })).toMatch(/\n---\n\n# Дока\n/)
  })

  it('ничего не отдаёт, пока коллекции не собраны', () => {
    expect(render({ collections: {} })).toBe('')
  })
})
