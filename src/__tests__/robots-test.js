const fs = require('fs')
const path = require('path')

const robots = fs.readFileSync(path.join(__dirname, '../robots.txt'), 'utf8')

// Группа — подряд идущие строки User-agent и правила после них до пустой строки
const groups = robots
  .split(/\n\s*\n/)
  .map((block) => block.split('\n').filter(Boolean))
  .filter((lines) => /^user-agent:/i.test(lines[0]))
  .map((lines) => ({
    agents: lines.filter((line) => /^user-agent:/i.test(line)).map((line) => line.split(':')[1].trim()),
    rules: lines.filter((line) => !/^user-agent:/i.test(line)),
  }))

const groupOf = (agent) => groups.find((group) => group.agents.includes(agent))

describe('robots.txt', () => {
  it('закрывает поиск в каждой группе: бот с именной группой не читает группу *', () => {
    groups.forEach((group) => expect(group.rules).toContain('Disallow: /search'))
  })

  it('называет ИИ-ботов поимённо', () => {
    ;['GPTBot', 'ClaudeBot', 'OAI-SearchBot', 'PerplexityBot', 'YandexAdditional', 'YandexAdditionalBot'].forEach(
      (agent) => expect(groupOf(agent)).toBeDefined(),
    )
  })

  it('говорит, для чего можно брать тексты', () => {
    ;['*', 'GPTBot'].forEach((agent) =>
      expect(groupOf(agent).rules).toContainEqual(
        expect.stringMatching(/^Content-Signal: search=\w+, ai-input=\w+, ai-train=\w+$/),
      ),
    )
  })
})
