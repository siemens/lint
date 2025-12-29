const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyWarnings, assertOnlyInfos } = require("./base.js")

const path = 'error/';
const rulesetPath = "test/testdata/error/.spectral.yml";

test('API MUST use official HTTP status codes as intended', async () => {
  const specFilePath = getSpecFilePath(path, "300.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[300]");
    //Problem in line:35-40
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[301]");
  });
})

test('SHOULD only use most common HTTP status codes', async () => {
  const specFilePath = getSpecFilePath(path, "301.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    //Problem in line:35-40
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[301]");
    assertOnlyWarnings(results);
  });
})

  test('SHOULD use the most specific HTTP status code when returning errors', async () => {
    const specFilePath = getSpecFilePath(path, "302.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
        //Problem in line:130
        const warnings = resultsForSeverity(results, "Warning");
        expect(warnings).toHaveLength(1);
        expect(warnings[0].code).toBe("Siemens-API-[302]");
        assertOnlyWarnings(results);
    });
  })

  test('Error object SHOULD be represented according to the defined structure fields', async () => {
    const specFilePath = getSpecFilePath(path, "305.1.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      //Problem in line:110
      const warnings = resultsForSeverity(results, "Warning");
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe("Siemens-API-[305]-1");
      assertOnlyWarnings(results);
    });
  })

  test('The error links resource object MAY contain the members: about, type', async () => {
    const specFilePath = getSpecFilePath(path, "305.2.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      //Problem in line:114-117
      const infos = resultsForSeverity(results, "Information");
      expect(infos).toHaveLength(1);
      expect(infos[0].code).toBe("Siemens-API-[305]-2");
      assertOnlyInfos(results)
    });
  })

  test('The source object SHOULD include one of the members or be omitted: pointer, parameter, header', async () => {
    const specFilePath = getSpecFilePath(path, "305.3.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      //Problem in line:114-117
      const warnings = resultsForSeverity(results, "Warning");
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe("Siemens-API-[305]-3");
      assertOnlyWarnings(results);
    });
  })