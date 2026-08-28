module.exports = {
  testEnvironment: 'jest-environment-node',
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
  },
  // linkedom и его зависимости поставляются как ESM, а jest грузит node_modules
  // как CommonJS и падает на `import`. Эти пакеты нужны тестам трансформаций:
  // именно через linkedom сборка разбирает HTML.
  transformIgnorePatterns: [
    '/node_modules/(?!(linkedom|css-select|css-what|boolbase|domhandler|domutils|domelementtype' +
      '|nth-check|entities|htmlparser2|uhyphen|cssom|html-escaper|dom-serializer)/)',
  ],
}
