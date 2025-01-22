/**
 * Copyright Siemens 2024.
 * SPDX-License-Identifier: MIT
 */
import eslintJs from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from 'typescript-eslint';
import angularTypescriptConfig from '@siemens/eslint-config-angular';
import tsdocPlugin from 'eslint-plugin-tsdoc';
import eslintPluginHeaders from 'eslint-plugin-headers';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  { ignores: ['dist'] },
  eslintJs.configs.recommended,
  {
    plugins: { 'headers': eslintPluginHeaders },
    rules: {
      'headers/header-format': [
        'error',
        {
          'source': 'string',
          'content': 'Copyright Siemens 2024.\nSPDX-License-Identifier: MIT'
        }
      ]
    }
  },
  ...typescriptEslint.config({
    name: 'typescript-eslint',
    extends: [...angularTypescriptConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: [
          './eslint-plugin-defaultvalue/tsconfig.json',
          './eslint-plugin-defaultvalue/tsconfig.test.json'
        ],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      'tsdoc': tsdocPlugin,
      'headers': eslintPluginHeaders
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['off'],
      'no-console': [
        'error',
        {
          allow: ['warn', 'error']
        }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowDirectConstAssertionInArrowFunctions: true
        }
      ],
      'tsdoc/syntax': ['error'],
      'headers/header-format': [
        'error',
        {
          'source': 'string',
          'content': 'Copyright Siemens 2024.\nSPDX-License-Identifier: MIT'
        }
      ]
    }
  })
];
