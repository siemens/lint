const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyInfos, assertOnlyHints } = require("./base.js")

const path = 'filtering/';
const rulesetPath = "test/testdata/filtering/.spectral.yml";

test('An API provider MAY NOT support more than 4 parameters at once for selecting resources', async () => {
  const specFilePath = getSpecFilePath(path, "400.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const hints = resultsForSeverity(results, "Hint");
    expect(hints).toHaveLength(2);
    expect(hints[0].code).toBe("Siemens-API-[400]");
    expect(hints[1].code).toBe("Siemens-API-[401]");
    //Problem in line:29-62
    assertOnlyHints(results);
  });
})

test('The query parameter filter SHOULD be used to filter or query data', async () => {
  const specFilePath = getSpecFilePath(path, "401.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(0);
    assertOnlyInfos(results);
  });
})