#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {join} = require('path');
const process = require('process')
const spectralCore = require('@stoplight/spectral-core');
const Parsers = require('@stoplight/spectral-parsers');
const spectralRuntime = require('@stoplight/spectral-runtime');
const { resolver } = require('@stoplight/spectral-ref-resolver');
const {DiagnosticSeverity} = require('@stoplight/types');
const {bundleAndLoadRuleset} = require('@stoplight/spectral-ruleset-bundler/with-loader');

const Handlebars = require('handlebars');
const Underscore = require('underscore');
const {argument} = require('./argument');

const fetch = spectralRuntime;
const {Spectral, Document} = spectralCore;
const {specPath, rulesetPath, failSeverity, consoleSeverity, outputFilename, jsonFile,resolve: resolveRefs } = argument();
const yaml = require('js-yaml');

var reportFileName = outputFilename;
if (!outputFilename.endsWith(".html")){
    reportFileName = reportFileName + ".html";
}

const fileExists = (filepath) => {
    return fs.existsSync(path.join(filepath));
}

const loadFile = (filepath) => {
    return fs.readFileSync(path.join(filepath), { encoding: "utf8" });
}

const writeToFile = (data, filename) => {
    fs.writeFileSync(path.join(filename), data, { encoding: "utf8" });
}

const specFilePath = path.resolve(specPath);
if (!fileExists(specFilePath)){
    throw Error(`Unable to resolve spec file path ${specFilePath}`);
}

for (const filepath of rulesetPath) {
    const abs_filepath = path.resolve(filepath)
    if (!fileExists(abs_filepath)){
        throw Error(`Unable to resolve ruleset file path ${abs_filepath}`);
    }
}

const formatJSON = (rules, results) => {
    const severityMap = getSeverityMap();
    var totalRuleCount = 0;
    var enabledCount = 0;
    var data = [];
    var index = 0;
    for (const key in rules){
        var rule = rules[key];
        var ruleResult = {};
        ruleResult.ruleName = rule.name;
        ruleResult.ruleDescription = rule.description;
        ruleResult.documentUrl = rule.documentationUrl;
        ruleResult.details = [];
        ruleResult.severity = rule.severity;
        ruleResult.hasDetails = false;
        if (rule.enabled){
            ruleResult.success = true;
            ruleResult.enabled = true;
            ruleResult.class = "table-success";
            ruleResult.message = "success";
            ruleResult.index = index;
            enabledCount++;
            index++;
            data.push(ruleResult);
            totalRuleCount++;
        }
    }
    var newResults = [];
    results.forEach( o => {
        let newObj = {};
        newObj.line = (o.range.start.line + 1) + ":" + (o.range.start.character + 1);
        newObj.severity = severityMap[o.severity];
        newObj.code = o.code;
        newObj.message = o.message;
        newObj.path = o.path.join("_");
        newResults.push(newObj);
        for (const ruleResult of data){
            if (ruleResult.ruleName == o.code){
                ruleResult.success = false;
                if (newObj.severity == "error"){
                    ruleResult.class = "table-danger";
                }
                else if (newObj.severity == "warn"){
                    ruleResult.class = "table-warning";
                }
                else {
                    ruleResult.class = "table-info";
                }
                ruleResult.message =  (ruleResult.details.length + 1) + " " + newObj.severity;
                if (ruleResult.details.length > 0){
                    ruleResult.message = ruleResult.message + "s";
                }
                ruleResult.hasDetails = true;
                ruleResult.details.push(newObj);
                break;
            }
        }
    })
    let jsonResult = {
        "data": data,
        "timestamp": new Date().toLocaleString(),
    };
    let severityDist = Underscore.countBy(newResults, "severity");
    jsonResult.messageCount = results.length;
    jsonResult.errorCount = severityDist.error || 0;
    jsonResult.warnCount = severityDist.warn || 0;
    jsonResult.infoCount = severityDist.info || 0;
    jsonResult.hintCount = severityDist.hint || 0;
    jsonResult.totalCount = totalRuleCount || 0;
    jsonResult.enabledCount = enabledCount || 0;
    return jsonResult;
}

const getSeverityMap = () => {
    const severityMap = {};
    severityMap[DiagnosticSeverity.Error] = "error";
    severityMap[DiagnosticSeverity.Warning] = "warn";
    severityMap[DiagnosticSeverity.Information] = "info";
    severityMap[DiagnosticSeverity.Hint] = "hint";
    return severityMap;
}

const mapSeverity = (severity) => {
    var severityValue = DiagnosticSeverity.Error;
    switch(severity)
    {
        case "error":
            severityValue = DiagnosticSeverity.Error;
            break;
        case "warn":
            severityValue = DiagnosticSeverity.Warning;
            break;
        case "info":
            severityValue = DiagnosticSeverity.Information;
            break;
        case "hint":
            severityValue = DiagnosticSeverity.Hint;
            break;
        default:
            break;
    }
    return severityValue;
}

const generateReport = (jsonObj) => {
    let htmlStr = loadFile(join(__dirname, "/templates/template.html"));
    Handlebars.registerHelper("inc", (val) => {
        return parseInt(val) + 1;
    });
    let template = Handlebars.compile(htmlStr);
    let data = template(jsonObj);
    writeToFile(data, reportFileName);
}

const linter =  async (specFilePath, rulesetPath, followRefs) => {
    const myDocument = new Document(
        fs.readFileSync(specFilePath, "utf-8").trim(),
        Parsers.Yaml,
        specFilePath
      );

    const spectral = new Spectral( { resolver } );
    var tempFilePath = "";
    var isMultiRuleFiles = false;

    if (rulesetPath.length > 1) {
        isMultiRuleFiles = true;
        const masterRulesetContent = {
            extends: rulesetPath.map(file => path.resolve(file)),
        };
        const contentString = yaml.dump(masterRulesetContent, { indent: 2 });
        const tempDir = process.cwd();
        const tempFileName = `.spectral-${Date.now()}.yaml`;
        tempFilePath = path.join(tempDir, tempFileName);
        fs.writeFileSync(tempFilePath, contentString, 'utf8');
    }
    else {
        tempFilePath = path.resolve(rulesetPath[0]);
    }
    spectral.setRuleset(await bundleAndLoadRuleset(tempFilePath, { fs, fetch }));
    var binded = {};

    const runPromise = followRefs
      ? spectral.run(myDocument, { resolve: true })
      : spectral.run(myDocument);

    await runPromise.then(results => {
        binded.rules = spectral.ruleset.rules;
        binded.results = results;
    });
    
    try {
        if (isMultiRuleFiles && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath); 
        }
    } catch (cleanupErr) {
        console.error(`Remove temporary file ${tempFilePath} failed. Please delete mannually.`);
    }
    
    return binded;
}

const severeEnoughToFail = (results, failSeverity) => {
    const diagnosticSeverity = mapSeverity(failSeverity);
    return results.some(r => r.severity <= diagnosticSeverity);
}

const consoleMsgPart = (results, consoleSeverity) => {
    const diagnosticSeverity = mapSeverity(consoleSeverity);
    return results.filter(r => r.severity <= diagnosticSeverity).sort((a, b) => a.severity - b.severity);
}

const getSeverityMsgMap = () => {
    const severityMap = {};
    severityMap[DiagnosticSeverity.Error] = "Error";
    severityMap[DiagnosticSeverity.Warning] = "Warning";
    severityMap[DiagnosticSeverity.Information] = "Information";
    severityMap[DiagnosticSeverity.Hint] = "Hint";
    return severityMap;
}

const resolveRuleDependencyResult = (rules, results) => {
  const dependsOnMap = {};
  for (const [ruleName, ruleDef] of Object.entries(rules)) {
    const deps = ruleDef?.definition?.['x-dependsOn'];
    if (deps) {
      dependsOnMap[ruleName] = Array.isArray(deps) ? deps : [deps];
    }
  }

  const allDepsCache = {};
  const getAllDependencies = (ruleName, visited = new Set()) => {
    if (allDepsCache[ruleName]) return allDepsCache[ruleName];
    const directDeps = dependsOnMap[ruleName] || [];
    const deps = new Set();

    for (const dep of directDeps) {
      if (visited.has(dep)) continue;
      deps.add(dep);
      const transitiveDeps = getAllDependencies(dep, new Set(visited).add(ruleName));
      for (const d of transitiveDeps) {
        deps.add(d);
      }
    }

    allDepsCache[ruleName] = deps;
    return deps;
  };

  const issuesByLocation = new Map();
  for (const issue of results) {
    const locationKey = issue.path?.join('.') || '';
    if (!issuesByLocation.has(locationKey)) {
      issuesByLocation.set(locationKey, []);
    }
    issuesByLocation.get(locationKey).push(issue);
  }

  const filteredResults = [];

  for (const [locationKey, issues] of issuesByLocation.entries()) {
    const failedRules = new Set(issues.map(i => i.code));

    for (const issue of issues) {
      const ruleCode = issue.code;
      const allDeps = getAllDependencies(ruleCode);
      const hasFailedAncestor = [...allDeps].some(dep => failedRules.has(dep));

      if (!hasFailedAncestor) {
        filteredResults.push(issue);
      }
    }
  }

  return filteredResults;
};

linter(specFilePath, rulesetPath, resolveRefs).then(linterResult => {
    const spectralResult = resolveRuleDependencyResult(linterResult.rules, linterResult.results);

    const spectralReport = path.resolve(jsonFile);
    fs.writeFileSync(spectralReport, JSON.stringify(spectralResult), { encoding: "utf8" });
    
    const jsonResult = formatJSON(linterResult.rules, spectralResult);
    generateReport(jsonResult);
    const reportFilePath = path.resolve(reportFileName);
    const isErrorSeverity = mapSeverity(failSeverity) === DiagnosticSeverity.Error;
    const failed = severeEnoughToFail(spectralResult, failSeverity);
    const consolePart = consoleMsgPart(spectralResult, consoleSeverity);
    const consoleMsg = consolePart.map(error=>
        `--------------------------------------------------
${getSeverityMsgMap()[error.severity]}:
Line: [${error.range.start.line}:${error.range.start.character}-${error.range.end.line}:${error.range.end.character}]
Path: [${error.path.join('.')}]
Desc: [${error.code} ${error.message} ]`).join('\n');
    if (failed)
    {

        process.stdout.write(
            `Results with severity of '${failSeverity}' ${isErrorSeverity ? '' : 'or higher '}found!\n` + 
            consoleMsg + 
            `\n--------------------------------------------------
Detailed report: ` + reportFilePath + '\n',
        );
        process.exit(1);
    }
    else {
        process.stdout.write(
            `No results with a severity of '${failSeverity}' ${isErrorSeverity ? '' : 'or higher '}found!\n` + 
            consoleMsg + 
            `\n--------------------------------------------------
Detailed report: ` + reportFilePath + '\n',
        );
        process.exit(0);
    }
});


