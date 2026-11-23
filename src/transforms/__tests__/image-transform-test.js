// eleventy-img собран как ESM, и jest его не загружает. Для имён файлов он не нужен
jest.mock('@11ty/eleventy-img', () => ({ default: {} }))

const { filenameFormat } = require('../image-transform')

describe('image-transform: имена ресайзов', () => {
  it('ставит ширину перед расширением с буквой w впереди', () => {
    expect(filenameFormat('id', '/images/1.png', 300, 'webp')).toBe('1-w300.webp')
  })

  // nginx превью перехватывает адреса по регулярке `-(\d+)w\.` и вместо файла
  // из сборки ужимает оригинал на лету, а для webp отвечает 415
  it('не попадает под регулярку ресайза на сервере превью', () => {
    for (const width of [300, 600, 1200, 2200]) {
      for (const format of ['webp', 'png', 'jpeg']) {
        expect(filenameFormat('id', '/images/cover.jpg', width, format)).not.toMatch(/-\d+w\./)
      }
    }
  })
})
