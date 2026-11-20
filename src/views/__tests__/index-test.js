const index = require('../index.11tydata')
const { baseUrl } = require('../../../config/constants')

describe('index: данные главной для агентов', () => {
  it('ссылается на markdown-версию главной', () => {
    expect(index.markdownUrl).toBe(`${baseUrl}/index.md`)
  })

  it('описывает Доку разметкой Organization с полями, которые читают поисковики', () => {
    const { organization } = index

    expect(organization['@type']).toBe('Organization')
    expect(organization).toEqual(
      expect.objectContaining({
        name: 'Дока',
        url: `${baseUrl}/`,
        logo: expect.stringMatching(/^https?:\/\//),
        description: expect.any(String),
      }),
    )
  })

  it('ссылается на профили абсолютными адресами', () => {
    const { sameAs } = index.organization

    expect(sameAs.length).toBeGreaterThan(0)
    sameAs.forEach((url) => expect(url).toMatch(/^https:\/\//))
  })
})
