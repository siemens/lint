# Siemens Lint

Siemens Lint helps you to improve and keep the code quality of your project on
a high level. It provides presets and plugins for various linters used at
Siemens.

We welcome contributions of further linting rules and configs to be added to
this repo for various other programming languages and frameworks.

**Presets available for following linters:**

- [typescript-eslint](https://typescript-eslint.io/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [stylelint](https://stylelint.io/)
- [commitlint](https://commitlint.js.org/)
- [Prettier](https://prettier.io/)

**Plugins:**

- [eslint-plugin-defaultvalue](./eslint-plugin-defaultvalue/README.md)
  for [typescript-eslint](https://typescript-eslint.io/) to automatically
  annotate the `@defaultValue` TSDoc tag

## Installation

Install `@siemens/*-config*` and their peer dependencies in your project (whichever you need):

```bash
npm install @siemens/stylelint-config-scss --save-dev --save-exact
npm install @siemens/commitlint-config --save-dev --save-exact
npm install @siemens/prettier-config --save-dev --save-exact
npm install @siemens/eslint-config-typescript --save-dev --save-exact
npm install @siemens/eslint-config-angular --save-dev --save-exact
```

**_Note_** _You should specify the exact versions of the packages above and
their peer dependencies like `eslint` and its plugins, `stylelint`,
`stylelint-config-sass-guidelines` and `@commitlint/config-conventional`. Rules
will get changed in the patch releases._

### ESLint

Our ESLint configurations does not include any formatting rules.
Please use a formatter like [Prettier](https://prettier.io/)
or add a formatting ruleset for ESLint like [ESLint Stylistic](https://eslint.style/).

#### TypeScript

Include the ESLint preset in your root `eslint.config.mjs`:

```js
import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from 'typescript-eslint';
import typescriptConfig from '@siemens/eslint-config-typescript';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default typescriptEslint.config({
  extends: [...typescriptConfig],
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json', 'e2e/tsconfig.json'],
      tsconfigRootDir: __dirname
    }
  }
});
```

> **Note:** to use less strict rules, use the `base` rules, by importing
> `{ configBase }` instead.

#### Angular

Include the ESLint preset in your root `eslint.config.mjs`:

```js
import path from 'path';
import { fileURLToPath } from 'url';
import typescriptEslint from 'typescript-eslint';
import angularTypescriptConfig from '@siemens/eslint-config-angular';
import angularTemplateConfig from '@siemens/eslint-config-angular/template';

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsConfig = typescriptEslint.config({
  extends: [...angularTypescriptConfig],
  files: ['**/*.ts'],
  languageOptions: {
    parserOptions: {
      project: ['tsconfig.json', 'tsconfig.app.json', 'tsconfig.spec.json', 'e2e/tsconfig.json'],
      tsconfigRootDir: __dirname
    }
  },
  rules: {
    '@angular-eslint/directive-selector': [
      'error',
      {
        type: 'attribute',
        prefix: 'app',
        style: 'camelCase'
      }
    ],
    '@angular-eslint/component-selector': [
      'error',
      {
        type: 'element',
        prefix: 'app',
        style: 'kebab-case'
      }
    ]
  }
});

const templateConfig = typescriptEslint.config({
  extends: [...angularTemplateConfig],
  files: ['**/*.html']
});

export default typescriptEslint.config(...tsConfig, ...templateConfig);
```

For libraries and other things in the `projects` directory,
create an additional `eslint.config.mjs` for each project that looks like this:

```js
import typescriptEslint from 'typescript-eslint';
import { tsConfig, templateConfig } from '../../eslint.config.mjs';

export default typescriptEslint.config(
  {
    extends: [...tsConfig],
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['projects/element-ng/tsconfig.lib.json', 'projects/element-ng/tsconfig.spec.json']
      }
    },
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'si',
          style: 'kebab-case'
        }
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'si',
          style: 'camelCase'
        }
      ]
    }
  },
  ...templateConfig
);
```

The `@angular-eslint/builder` will not automatically pick up the library
config location, manually provide it in `angular.json`:

```diff
@@ -122,15 +125,11 @@
          }
        },
        "lint": {
          "builder": "@angular-eslint/builder:lint",
          "options": {
            "lintFilePatterns": [
              "src/**/*.ts",
              "src/**/*.html"
            ],
+           "eslintConfig": "path/to/project/eslint.config.mjs"
          }
        },
```

#### Migration from TSLint

Also in `angular.json`, make sure to replace the TSLint related entries like
this:

```diff
@@ -122,15 +125,11 @@
          }
        },
        "lint": {
-         "builder": "@angular-devkit/build-angular:tslint",
+         "builder": "@angular-eslint/builder:lint",
          "options": {
-           "tsConfig": [
-             "tsconfig.app.json",
-             "tsconfig.spec.json",
-             "e2e/tsconfig.json"
-           ],
-           "exclude": [
-             "**/node_modules/**"
+           "lintFilePatterns": [
+             "src/**/*.ts",
+             "src/**/*.html"
            ]
          }
        },
```

> **Note:** to use less strict rules, which are derived from the upstream
> Angular recommendation and more geared towards applications, use the `base`
> rules, by importing `{ configBase }` instead.

### Stylelint

Include the stylelint preset in your `.stylelintrc.yml`:

```yml
extends:
  - '@siemens/stylelint-config-scss/stylelintrc.yml'
```

### Commitlint

Include the commitlint preset in your `package.json`:

```json
  "commitlint": {
    "extends": [
      "@siemens/commitlint-config/.commitlintrc.js"
    ]
  },

// Optional: Pre-commit hook using husky: https://github.com/typicode/husky
  "husky": {
      "hooks": {
        "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
      }
    },
```

### Prettier

Include the shared Prettier config in your `package.json`:

```json
"prettier": "@siemens/prettier-config",
```

### ESLint Plugin

The usage of the ESLint plugin is documented [here](./eslint-plugin-defaultvalue/README.md).

## Usage

The preset will now be automatically used by `eslint` and `ng lint`. Please
refer to the [Angular ESLint](https://github.com/angular-eslint/angular-eslint) and
[ng lint](https://angular.io/cli/lint) documentation for more details.

Add the commitlint, ESlint and stylelint scripts to your `package.json`:

```json
"scripts": {
  "lint": "ng lint",
  "lint:sass": "stylelint **.scss",
  "lint:commit": "commitlint --from=origin/main",
  "lint:all": "npm run lint:commit && npm run lint && npm run lint:sass"
}
```

To fix ESLint issues automatically use:

```json
"scripts": {
  "lint:fix": "ng lint --fix"
}
```

To fix stylelint issues automatically use:

```json
"scripts": {
  "lint:sass:fix": "stylelint --fix **.scss"
}
```

Make sure to call the linters in your CI build chain in `.gitlab-ci.yml`:

```yml
lint:
  stage: tests
  script:
    - npm install
    - npm run lint:all
```

> **Note:** To make commitlint work in Gitlab CI, one needs to set the
> `Git shallow clone` setting to `0` (found in project `settings` > `CI / CD`).
> That way GitLab CI fetches all branches and tags each time.

## Contributing

Improvements are always welcome! Feel free to log a bug,
write a suggestion or contribute code by creating a pull request.
All details are listed in our contribution guide.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Code and documentation Copyright (c) Siemens 2018 - 2024.

See [LICENSE.md](LICENSE.md).
