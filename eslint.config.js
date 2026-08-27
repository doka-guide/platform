// Flat-конфиг вместо .eslintrc.json и .eslintignore: eslint 10 поддерживает
// только этот формат, старый удалён из ядра.
const js = require('@eslint/js')
const globals = require('globals')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const jest = require('eslint-plugin-jest')

module.exports = [
  {
    // Переехало из .eslintignore. Разделы контента подключены симлинками и
    // содержат демки со своим кодом — линтить чужие файлы не нужно.
    ignores: [
      'node_modules/**',
      'dist/**',
      'bin/**',
      'src/html/**',
      'src/css/**',
      'src/js/**',
      'src/tools/**',
      'src/recipes/**',
      'src/a11y/**',
      'src/pages/**',
      'src/people/**',
      'src/specials/**',
      'src/interviews/**',
    ],
  },

  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      semi: ['warn', 'never'],
    },
  },

  // Правила jest подключаются только к тестам: раньше plugin:jest/recommended
  // висел на всём проекте, хотя за пределами __tests__ он ничего не проверяет.
  {
    files: ['**/__tests__/**/*.js'],
    ...jest.configs['flat/recommended'],
  },

  // Идёт последним: отключает форматирующие правила, конфликтующие с prettier,
  // и включает сам prettier как правило.
  prettierRecommended,
]
