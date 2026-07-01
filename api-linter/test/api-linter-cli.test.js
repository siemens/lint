const path = require('path');
const fs   = require('fs');
const { spawnSync } = require('child_process');

/* ─────────── paths used by both tests ─────────── */
const cli     = path.join(__dirname, '..', 'src', 'index.js');
const ruleset = path.join(__dirname, 'testdata', 'refs', '.spectral.yml');
const spec    = path.join(__dirname, 'testdata', 'refs', '300.yml');

/* handy wrapper to invoke the CLI */
function runLinter({ resolveFlag, reportFile }) {
  const args = [
    cli,
    '--specPath',    spec,
    '--rulesetPath', ruleset,
    '--failSeverity','error',
    '--outputFilename', reportFile
  ];
  if (resolveFlag) args.push('--resolve');

  return spawnSync('node', args, { encoding: 'utf8' });
}

describe('api-linter CLI external $ref behaviour', () => {
  const reportWith    = path.join(__dirname, 'tmp-report-resolve.html');
  const reportWithout = path.join(__dirname, 'tmp-report-no-resolve.html');

  /* clean-up generated HTML files after the suite finished */
  afterAll(() => {
    [reportWith, reportWithout].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });
  });

  test('with --resolve follows external refs (no invalid-ref)', () => {
    const { status, stdout } = runLinter({
      resolveFlag: true,
      reportFile:  reportWith
    });

    /* exit-code still 1 because the real rule fires */
    expect(status).toBe(1);
    expect(stdout).toMatch(/Siemens-API-\[300]/);   // rule present
    expect(stdout).not.toMatch(/invalid-ref/);      // resolver worked
    expect(fs.existsSync(reportWith)).toBe(true);   // report created
  });

  test('without --resolve produces invalid-ref error', () => {
    const { status, stdout } = runLinter({
      resolveFlag: false,
      reportFile:  reportWithout
    });

    expect(status).toBe(1);
    expect(stdout).toMatch(/Siemens-API-\[300]/);   // rule present
    expect(stdout).toMatch(/Siemens-API-\[301]/);   // rule present
    expect(stdout).not.toMatch(/invalid-ref/);     // Spectral never tried to search for external references
    expect(fs.existsSync(reportWithout)).toBe(true);
  });
});