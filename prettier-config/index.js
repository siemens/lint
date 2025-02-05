/**
 * Copyright Siemens 2024.
 * SPDX-License-Identifier: MIT
 *
 /

 /**
 * @type { import("prettier").Config }
 */
const config = {
  printWidth: 100,
  trailingComma: 'none',
  arrowParens: 'avoid',
  htmlWhitespaceSensitivity: 'strict',
  quoteProps: 'preserve',
  singleQuote: true,
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular'
      }
    },
    {
      files: 'index.html',
      options: {
        parser: 'html'
      }
    },
    {
      files: '*.json5',
      options: {
        singleQuote: false
      }
    }
  ]
};

export default config;
