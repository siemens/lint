const { retrieveDocument, setupSpectral} = require('@jamietanna/spectral-test-harness')
const {resultsForSeverity, getSpecFilePath, assertOnlyErrors, assertOnlyWarnings, assertOnlyInfos } = require("./base.js")

const path = 'mediatype/';
const rulesetPath = "test/testdata/mediatype/.spectral.yml";

test('Siemens Xcelerator recommends the media type application/json for exchanging data.', async () => {
  const specFilePath = getSpecFilePath(path, "100.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[100]");
    //Problem in line:32
    assertOnlyInfos(results);
  });
})

test('The root of every document SHOULD contain a JSON object', async () => {
  const specFilePath = getSpecFilePath(path, "101-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[101.1]");
    //Problem in line:38
    assertOnlyWarnings(results);
  });
})

test('A response document SHOULD contain at least one of the following:data,error,meta,links.', async () => {
  const specFilePath = getSpecFilePath(path, "101-2.1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[101.2]-1");
    //Problem in line:40-42, properties should contain at least one of data,error,meta,links
    assertOnlyWarnings(results);
  });
})

test('A request document SHOULD contain at least data', async () => {
  const specFilePath = getSpecFilePath(path, "101-2.2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[101.2]-2");
    //Problem in line:45-47, properties should contain at least data
    assertOnlyWarnings(results);
  });
})

test('The data type MUST be compliant with the types defined', async () => {
  const specFilePath = getSpecFilePath(path, "101-4-1.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[101.4.1]");
    //Problem in line:87, should be one of boolean|object|array|integer|number|string
    assertOnlyErrors(results);
  });
})

test('A meta object SHOULD be used to represent meta information as a JSON object', async () => {
  const specFilePath = getSpecFilePath(path, "101-7-2.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const errors = resultsForSeverity(results, "Error");
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe("Siemens-API-[101.7.2]");
    //Problem in line:77, should be type: object
    const infos = resultsForSeverity(results, "Information");
    expect(infos).toHaveLength(1);
    expect(infos[0].code).toBe("Siemens-API-[101.7]");
  });
})

test('Field names SHOULD use lower camel case', async () => {
  const specFilePath = getSpecFilePath(path, "101-8.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[101.8]");
    //Problem in line:68, should be addressDetail
    assertOnlyWarnings(results);
  });
})

test('Resource names SHOULD be in lowercase with hyphen', async () => {
  const specFilePath = getSpecFilePath(path, "101-9.yml");
  const spectral = await setupSpectral(rulesetPath);
  const document = retrieveDocument(specFilePath);
  spectral.run(document).then(results => {
    const warnings = resultsForSeverity(results, "Warning");
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("Siemens-API-[101.9]");
    //Problem in line:20, should be room-details 
    assertOnlyWarnings(results);
  });
})



