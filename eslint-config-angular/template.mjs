/**
 * Copyright Siemens 2024.
 * SPDX-License-Identifier: MIT
 */
import angularEslint from 'angular-eslint';
import { defineConfig } from 'eslint/config';

export const configBase = defineConfig(...angularEslint.configs.templateRecommended);

export const configRecommended = defineConfig({
  extends: [...angularEslint.configs.templateAll, ...configBase],
  rules: {
    '@angular-eslint/template/click-events-have-key-events': ['off'],
    '@angular-eslint/template/conditional-complexity': ['off'],
    '@angular-eslint/template/cyclomatic-complexity': ['off'],
    '@angular-eslint/template/i18n': ['off'],
    '@angular-eslint/template/mouse-events-have-key-events': ['off'],
    '@angular-eslint/template/no-call-expression': ['off'],
    '@angular-eslint/no-experimental': ['off']
  }
});

export default configRecommended;
