const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyErrors, assertOnlyInfos } = require("./base.js")

const path = 'commonops/';
const rulesetPath = "test/testdata/commonops/.spectral.yml";

test('A Successful fetch of individual resources MUST return the status code 200', async () => {
  const specFilePath = getSpecFilePath(path, "800-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[800.1]");
    //Problem in line:29
    assertOnlyErrors(results);
  });
})

test('A successful fetch of resource collection request MUST return a 2xx status code', async () => {
  const specFilePath = getSpecFilePath(path, "800-2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[800.2]");
    //Problem in line:37
    assertOnlyErrors(results);
  });
})

test('An API Provider MUST support fetching resource data for provided links', async () => {
  const specFilePath = getSpecFilePath(path, "800-4.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[800.4]");
    //Problem in line:50
    assertOnlyErrors(results);
  });
})

test('The POST request MUST include a single resource object as primary data', async () => {
  const specFilePath = getSpecFilePath(path, "801.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[801]");
    //Problem in line:45-47
    assertOnlyErrors(results);
  });
})

test('API MUST respond to successful POST creation request with 2xx success status code', async () => {
  const specFilePath = getSpecFilePath(path, "801-4.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[801.4]");
    //Problem in line:34
    assertOnlyErrors(results);
  });
})

test('API MUST respond to successful PATCH update request with 2xx success status code', async () => {
  const specFilePath = getSpecFilePath(path, "802-6.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[802.6]");
    //Problem in line:42
    assertOnlyErrors(results);
  });
})

test('API MUST respond to successful PUT update request with 2xx success status code', async () => {
  const specFilePath = getSpecFilePath(path, "803-2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[803.2]");
    //Problem in line:42
    assertOnlyErrors(results);
  });
})

test('API MUST respond to successful DELETE request with 2xx success status code', async () => {
  const specFilePath = getSpecFilePath(path, "804-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[804.1]");
    //Problem in line:37
    assertOnlyErrors(results);
  });
})

test('The API consumer MAY use conditional header information to solve concurrent update requests', async () => {
  const specFilePath = getSpecFilePath(path, "803-6.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[803.6]");
    //Problem in line:37-40
    assertOnlyInfos(results);
  });
})

