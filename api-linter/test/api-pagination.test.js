const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath,assertOnlyErrors, assertOnlyWarnings, assertOnlyInfos, assertOnlyHints } = require("./base.js")

const path = 'pagination/';
const rulesetPath = "test/testdata/pagination/.spectral.yml";

test('A server MAY provide links to traverse a paginated data set', async () => {
    const specFilePath = getSpecFilePath(path, "600.1.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      const infos = resultsForSeverity(results, "Information");
      expect(infos).toHaveLength(1);
      expect(infos[0].code).toBe("Siemens-API-[600]-1");
      assertOnlyInfos(results);
    });
  })

test('Pagination links SHOULD appear in the top-level links object.', async () => {
  const specFilePath = getSpecFilePath(path, "600.2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[600]-2");
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[600]-1");
  });
})

test('Naming convention MUST be used for pagination keys.', async () => {
  const specFilePath = getSpecFilePath(path, "600.3.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const hints = resultsForSeverity(results, "Hint");
    expect(hints).toHaveLength(1);
    expect(hints[0].code).toBe("Siemens-API-[600]-3");
    assertOnlyHints(results);
  });
})

test('Pagination SHOULD be implemented using query parameters.', async () => {
    const specFilePath = getSpecFilePath(path, "601.yml");
    const spectral = await setupSpectral(rulesetPath);
    const document = retrieveDocument(specFilePath);
    spectral.run(document).then(results => {
      const warnings = resultsForSeverity(results, "Warning");
      expect(warnings).toHaveLength(1);
      expect(warnings[0].code).toBe("Siemens-API-[601]");
    });
})

test('Server MAY provide pagination meta information to the client [601.1.1].', async () => {
  const specFilePath = getSpecFilePath(path, "601-1-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[601.1.1]");
    assertOnlyInfos(results);
  });
})

test('Server MAY provide pagination meta information to the client [601.2.1].', async () => {
  const specFilePath = getSpecFilePath(path, "601-2-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[601.2.1]");
    assertOnlyInfos(results);
  });
})

test('Server MAY provide pagination meta information to the client [601.3.1].', async () => {
  const specFilePath = getSpecFilePath(path, "601-3-1.1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[601.3.1]-1");
    assertOnlyInfos(results);
  });
})

test('Server MAY provide pagination meta information to the client [601.3.1].', async () => {
  const specFilePath = getSpecFilePath(path, "601-3-1.2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[601.3.1]-2");
    assertOnlyInfos(results);
  });
})