// test/api-errors-refs.test.js
const fs = require('fs');
const { Document } = require('@stoplight/spectral-core');
const Parsers = require('@stoplight/spectral-parsers');

// 👇   RE-ADD setupSpectral here
const { setupSpectral } =
  require('@jamietanna/spectral-test-harness');

const { resultsForSeverity } = require('./base.js');
const { resolver } = require('@stoplight/spectral-ref-resolver');
const path = require('path');

const rulesetPath  = 'test/testdata/refs/.spectral.yml';
const specFilePath = path.join(__dirname, 'testdata/refs', '300.yml'); // ABSOLUTE

test('API MUST use official HTTP status codes as intended', async () => {
  // ───────────── arrange ─────────────
  /* ── Spectral with resolver ── */
  const spectral = await setupSpectral(rulesetPath, { resolver });

  /* ── Document with correct source (real path!) ── */
  const raw      = fs.readFileSync(specFilePath, 'utf8');
  const document = new Document(raw, Parsers.Yaml, specFilePath);
  // … but give it the real filename so $ref resolution works
  document.source = specFilePath;

  // ───────────── act ─────────────
  const results  = await spectral.run(
    document,
    { resolve: { external: true } }
  );

  // ───────────── assert ─────────────
  const errors = resultsForSeverity(results, 'Error');
  expect(errors).toHaveLength(1);
  expect(errors[0].code).toBe('Siemens-API-[300]');
  //Problem in line:35-40
  const warnings = resultsForSeverity(results, 'Warning');
  expect(warnings).toHaveLength(1);
  expect(warnings[0].code).toBe('Siemens-API-[301]');
});
