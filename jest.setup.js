const { TextEncoder, TextDecoder } = require('util')

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

const { JSDOM } = require('jsdom')

global.JSDOM = JSDOM
