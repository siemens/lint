# Siemens API Linter

This project implements a linter reporter for the [Stoplight Spectral](https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview) for API specifications.
The ruleset has been created based on the [Siemens Xcelerator API guidelines 2.5.0](https://developer.siemens.com/guidelines/api-guidelines/rest/index.html).

## Getting started
### Directory structure

- `example/`: contains a sample API spec file
- `rulesets/`: contains the ruleset files those follow the Siemens Xcelerator API guidelines
- `src/`: contains the source files for creating the linter report
- `test/`: jest test cases for different rules in the rulesets

### Installation

In order to include the rulesets and provide linting within your project, you can install the package from this project with this `@siemens/api-linter` package. 

```json
{
  "scripts": {
      "test": "api-linter -s reference-api-specs/openapi.yml -r reference-api-specs/.spectral.yml"
  },
  "devDependencies": {
      "@xcelerator/api-linter": "^0.8.0"
  }
}
```

The `@siemens/api-linter` package includes the new Siemens REST API linter tool with html report capability.

In order to trigger the linter on your API specifications, it provides a script to execute the linter within the `package.json` specification.

```json
  "scripts": {
      "test": "api-linter -s reference-api-specs/openapi.yml -r reference-api-specs/.spectral.yml"
  }
```
Developers can change the spec file path with `-s` option, ruleset file path with `-r` option accordingly in the scripts.<br>
Or just remove them and set them in the command line as:<br>

Script:
```json
  "scripts": {
      "test": "api-linter"
  }
```
Command:
```groovy
npm test -s reference-api-specs/openapi.yml -r reference-api-specs/.spectral.yml
```

For more options:

```
Usage: api-linter -s "path-to-spec-file" -r "path-to-rule-file" [-f "fail-severity"] [-c "console-severity"] [-v "api-versioning"] [-a "api-security"]

Options:
  -s, --specPath <openapi spec>        path to openapi specification
  -r, --rulesetpath <rule file>        path to rules file
  -f, --failSeverity <fail severity>   test fails when met result the severity equal or higher than it (choices: "error", "warn", "info", "hint", default: warn)
  -c, --consoleSeverity <console severity> console output message for linter result no matter job failed or succeeded (choices: "error", "warn", "info", "hint", default: warn)
  -o, --outputFilename <output filename> specify the output filename with or without .html extension (default: linter-result.html)
  -p, --jsonFile <output json file>, output json file with origin spectral result data
  -v, --apiVersioning <api versioning> the api versioning way (choices: "ignore", "url", "header", default: ignore)
  -a, --apiSecurity <authorization security> if enable authorization security (choices: "n/f/no/false/y/t/yes/true" default: n)
  --resolve enables follow external $refs (same as Spectral --resolve) (default is not enabled, i.e. external references are not resolved and ignored)
  ```

A linter report will be generated according to the execution as:

![Example Image](linter-report.png)

### Linting within CI/CD

You can trigger linting on your CI/CD pipeline executing `npm test` within the `.gitlab-ci.yml` CI configuration file.

See the following configuration example:

```yaml
build:
  script:
    - npm test
  artifacts:
    name: "api-linter-report"
    paths:
      - linter-result.html
    when: always
```

> The Pipeline will fail if linter results with severity of `warn` (By default) or higher found!

> You may download or browse the report file in the job artifact page directly no matter CI job failed or succeeded.

### Selection of rulesets

The package provides several rulesets according to Siemens Xcelerator REST API guidelines.<br>
> They can be included as needed by providing a project specific `.spectral.yml` file on the projects root directory as follows:
```yaml
extends:
  - "@siemens/api-linter/rulesets/xcelerator-api-media-type.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-versioning.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-error-reporting.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-filtering.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-sparse-fieldsets.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-pagination.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-sorting.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-common-operation.yml"
  - "@siemens/api-linter/rulesets/xcelerator-api-security.yml"
```
> You MAY use as below to achieve this for guidline linting `WITHOUT` `"spectral:oas"`.
```yaml
extends:
  - "@siemens/api-linter/rulesets/xcelerator-api-express.yml"
```
> `OR` just extends the `ALL-IN-ONE` ruleset which with `"spectral:oas"` enabled.
```yaml
extends:
  - "@siemens/api-linter/rulesets/xcelerator-api.yml"
```
### Disable any Ruleset or Rules
> You can disable any rules/rulesets as you wish by [Stoplight Spectral](https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview).
```yaml
#e.g. disable spectral:oas ruleset and disable Siemens-API-[400] rules from the extended ruleset
extends:
  - "@siemens/api-linter/rulesets/xcelerator-api.yml"
  - ["spectral:oas", "off"]

rules:
  Siemens-API-[400]: false
  Siemens-API-[401]: false
```

### Define rule dependency relations
> Sometimes, if you don't want to follow a ruleC that under a high level ruleP, which means when ruleP failed, you don't want to check ruleC.
Then we can define the rules with `"x-dependsOn"` attribute.
```yaml
#e.g. Siemens-API-[101.8.1] depends on Siemens-API-[101.8]
extends:
  - "@xcelerator/api-linter/rulesets/xcelerator-api.yml"

rules:
  Siemens-API-[101.8.1]: 
    x-dependsOn:
      - Siemens-API-[101.8]
```

## Integration Using JavaScript
> In case you want to handle the linting results by yourself
```javascript
const {validator} = require('@siemens/api-linter/src/extension');
const {DiagnosticSeverity} = require('@stoplight/types');
const path = require("path");
const validate = validator();

const validateDoc = function(){
    const ruleSetFilePath = path.resolve(__dirname, 'reference-api-specs/.spectral.yml');
    const apiSpecFilePath = path.resolve(__dirname, 'reference-api-specs/openapi-prod.yml');
    validate(apiSpecFilePath, ruleSetFilePath).then(result => {
        const diagnostics = [];
        for (let msg of result.results || []){
            if (msg.severity <= DiagnosticSeverity.Information ){
                var diagnostic = { value: msg.code, severity: msg.severity, message: msg.message };
                diagnostics.push(diagnostic);
            }
        }
        // Add your own processes to handle diagnostic array;
    });
}
validateDoc();
```

