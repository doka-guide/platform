const { buildBody } = require('../preview-note')

const MARKER = '<!-- doka-preview-1371 -->'
const END = '<!-- /doka-preview-1371 -->'

function build(body, message = 'Превью опубликовано.') {
  return buildBody(body, MARKER, END, message)
}

describe('preview-note: заметка о превью в описании пулреквеста', () => {
  it('дописывает блок в конец описания', () => {
    const result = build('## Что сделано\n\nОтключает сервис-воркер.')

    expect(result).toBe('## Что сделано\n\nОтключает сервис-воркер.\n\n' + MARKER + '\nПревью опубликовано.\n' + END)
  })

  it('заменяет блок при повторном запуске, а не плодит второй', () => {
    const first = build('Описание.', 'Идёт сборка...')
    const second = buildBody(first, MARKER, END, 'Превью опубликовано.')

    expect(second.split(MARKER)).toHaveLength(2)
    expect(second).toContain('Превью опубликовано.')
    expect(second).not.toContain('Идёт сборка...')
  })

  it('не трогает текст автора вокруг блока', () => {
    // Главное, ради чего блок обрамлён маркерами: описание правит бот, а пишет
    // его человек, и потерять написанное нельзя.
    const withNote = build('Начало.')
    const edited = withNote + '\n\nДописано после публикации превью.'
    const result = buildBody(edited, MARKER, END, 'Новая ссылка.')

    expect(result).toContain('Начало.')
    expect(result).toContain('Дописано после публикации превью.')
    expect(result).toContain('Новая ссылка.')
  })

  it('справляется с пустым описанием', () => {
    expect(build('')).toBe(MARKER + '\nПревью опубликовано.\n' + END)
  })

  it('справляется с отсутствующим описанием', () => {
    // GitHub отдаёт body: null у пулреквеста без описания.
    expect(build(null)).toBe(MARKER + '\nПревью опубликовано.\n' + END)
  })

  it('не оставляет лишних переводов строки в конце описания', () => {
    const result = build('Описание.\n\n\n')

    expect(result).toBe('Описание.\n\n' + MARKER + '\nПревью опубликовано.\n' + END)
  })

  it('дописывает новый блок, если закрывающий маркер потерялся', () => {
    // Автор мог случайно затереть половину блока, правя описание руками.
    const result = build('Описание.\n\n' + MARKER + '\nСтарая ссылка.')

    expect(result.split(MARKER)).toHaveLength(3)
    expect(result).toContain('Превью опубликовано.')
  })
})
