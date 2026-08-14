const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyErrors, assertOnlyWarnings } = require("./base.js")

const path = 'versioning/';
const rulesetPath = "test/testdata/versioning/.spectral.yml";

test('Semantic versioning MUST be used to version individual APIs', async () => {
  global.apiVersioning = 'url';
  const specFilePath = getSpecFilePath(path, "semantic-versioning.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Semantic-Versioning-[2.0.0]");
    //Problem in line:35-40
    assertOnlyErrors(results);
  });
})

test('The Major version number MUST be specified in the URI as a path segment', async () => {
  global.apiVersioning = 'url';
  const specFilePath = getSpecFilePath(path, "200-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[200.1]");
    //Problem in line:13
    assertOnlyErrors(results);
  });
})

test('A request HTTP header e.g., Api-Version MUST be supported to allow client to specify the version.', async () => {
  global.apiVersioning = 'header';
  const specFilePath = getSpecFilePath(path, "200-2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[200.2]");
    //Problem in line:29
    assertOnlyErrors(results);
  });
})

test("A header with full semantic version value SHOULD be returned in the response with 'Api-Version: <MAJOR>.<MINOR>.<PATCH>'", async () => {
  global.apiVersioning = 'header';
  const specFilePath = getSpecFilePath(path, "201.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[201]");
    //Problem in line:44
    assertOnlyWarnings(results);
  });
})