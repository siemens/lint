/**
 * Copyright Siemens 2026.
 * SPDX-License-Identifier: MIT
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow longer lines in commit body/footer. Needed for longer links.
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
    'type-enum': [
      2,
      'always',
      [
        'build',
        'chore',
        'ci',
        'docs',
        'feat',
        'fix',
        'fixup', // fix up of an unreleased feature (message will NOT appear in the CHANGELOG)
        'perf',
        'refactor',
        'revert',
        'style',
        'test'
      ]
    ]
  }
};
