const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyErrors } = require("./base.js")

const path = 'security/';
const rulesetPath = "test/testdata/security/.spectral.yml";

test('No security problem test 1', async () => {
  global.apiSecurity = 'y';
  const specFilePath = getSpecFilePath(path, "valid.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    expect(results).toHaveLength(0);
  });
})

test('No security problem test 2', async () => {
  global.apiSecurity = 'n';
  const specFilePath = getSpecFilePath(path, "invalid.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    expect(results).toHaveLength(0);
  });
})

test('No security problem test 3', async () => {
  global.apiSecurity = 'n';
  const specFilePath = getSpecFilePath(path, "invalid.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    expect(results).toHaveLength(0);
  });
})

test('Has security problem test', async () => {
  global.apiSecurity = 'y';
  const specFilePath = getSpecFilePath(path, "invalid.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    expect(results).toHaveLength(1);
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-Security");
    assertOnlyErrors(results);
  });
})