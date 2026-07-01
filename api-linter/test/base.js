const { DiagnosticSeverity } = require('@stoplight/types')

function resultsForSeverity (results, severity) {
  return results.filter((r) => DiagnosticSeverity[r.severity] === severity)
}

const assertOnlyErrors = (results) => {
  const warnings = resultsForSeverity(results, "Warning");
  expect(warnings).toHaveLength(0);
  const infos = resultsForSeverity(results, "Information");
  expect(infos).toHaveLength(0);
  const hints = resultsForSeverity(results, "Hint");
  expect(hints).toHaveLength(0);
}

const assertOnlyWarnings = (results) => {
  const errors = resultsForSeverity(results, "Error");
  expect(errors).toHaveLength(0);
  const infos = resultsForSeverity(results, "Information");
  expect(infos).toHaveLength(0);
  const hints = resultsForSeverity(results, "Hint");
  expect(hints).toHaveLength(0);
}

const assertOnlyInfos = (results) => {
  const errors = resultsForSeverity(results, "Error");
  expect(errors).toHaveLength(0);
  const warnings = resultsForSeverity(results, "Warning");
  expect(warnings).toHaveLength(0);
  const hints = resultsForSeverity(results, "Hint");
  expect(hints).toHaveLength(0);
}

const assertOnlyHints = (results) => {
  const errors = resultsForSeverity(results, "Error");
  expect(errors).toHaveLength(0);
  const warnings = resultsForSeverity(results, "Warning");
  expect(warnings).toHaveLength(0);
  const infos = resultsForSeverity(results, "Information");
  expect(infos).toHaveLength(0);
}

const getSpecFilePath = (path, fileName) => {
  return path + fileName;
}

module.exports = {
  resultsForSeverity,
  getSpecFilePath,
  assertOnlyErrors,
  assertOnlyWarnings,
  assertOnlyInfos,
  assertOnlyHints
}
