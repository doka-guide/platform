const http = require('http')
const { URL } = require('url')
const { handler } = require('./functions/dynamic')

http
  .createServer(async (req, res) => {
    const urlData = new URL(req.url, 'http://localhost')

    const event = {
      path: urlData.pathname,
      queryStringParameters: Object.fromEntries(urlData.searchParams),
    }

    const result = await handler(event)

    res.writeHead(result.statusCode, result.headers)
    res.end(result.body)
  })
  .listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`)
  })
