module.exports = {
  plugins: [require('prettier-plugin-tailwindcss')],
  tailwindConfig: './tailwind.config.js',
  semi: false,
  tabWidth: 2,
  useTabs: false,
  printWidth: 80,
  endOfLine: 'auto',
  singleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'always',
}
