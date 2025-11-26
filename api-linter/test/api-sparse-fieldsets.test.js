const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyInfos } = require("./base.js")

const path = 'fields/';
const rulesetPath = "test/testdata/fields/.spectral.yml";

test('API MAY provide projection of fieldset in response', async () => {
    const specFilePath = getSpecFilePath(path, "500.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      const infos = resultsForSeverity(results, "Information");
      expect(infos).toHaveLength(1);
      expect(infos[0].code).toBe("Siemens-API-[500]");
      assertOnlyInfos(results);
    });
  })
