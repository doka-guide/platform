// Модуль читает .issues.json на верхнем уровне, и файла в репозитории нет —
// его готовит отдельный репозиторий doka-guide/cache. Подменяем виртуальным
// модулем, чтобы тест не зависел ни от наличия файла, ни от его содержимого.
jest.mock(
  '../../../.issues.json',
  () => [
    { user: { login: 'Solarrust' }, pull_request: {}, closed_at: '2021-05-20T10:00:00Z' },
    { user: { login: 'solarrust' }, pull_request: {}, closed_at: '2023-01-01T10:00:00Z' },
    { user: { login: 'solarrust' }, closed_at: null },
    { user: { login: 'pepelsbey' }, pull_request: {}, closed_at: '2022-07-07T10:00:00Z' },
  ],
  { virtual: true },
)

const { getAuthorContributionStats } = require('../github-contribution-stats/github-contribution-stats')

describe('getAuthorContributionStats', () => {
  const stats = getAuthorContributionStats()

  it('считает пулреквесты и issue раздельно', () => {
    expect(stats.solarrust.pr).toBe(2)
    expect(stats.solarrust.issues).toBe(1)
  })

  it('приводит логины к нижнему регистру и не двоит участника', () => {
    // В выборке есть и Solarrust, и solarrust — это один человек
    expect(Object.keys(stats)).toEqual(['solarrust', 'pepelsbey'])
  })

  it('запоминает дату самого раннего вклада', () => {
    expect(stats.solarrust.first).toEqual(new Date('2021-05-20T10:00:00Z'))
  })

  it('считает каждого участника отдельно', () => {
    expect(stats.pepelsbey.pr).toBe(1)
    expect(stats.pepelsbey.issues).toBe(0)
  })
})
