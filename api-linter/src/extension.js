#!/usr/bin/env node

const fs = require('fs');
const spectralCore = require('@stoplight/spectral-core');
const Parsers = require('@stoplight/spectral-parsers');
const spectralRuntime = require('@stoplight/spectral-runtime');
const {bundleAndLoadRuleset} = require('@stoplight/spectral-ruleset-bundler/with-loader');
const fetch = spectralRuntime;
const {Spectral, Document} = spectralCore;

const linter =  async (specFilePath, rulesetFilepath) => {
    const myDocument = new Document(
        fs.readFileSync(specFilePath, "utf-8").trim(),
        Parsers.Yaml,
        "openapi.yml",
    );
    const spectral = new Spectral();
    var rules = await bundleAndLoadRuleset(rulesetFilepath,{ fs, fetch });
    spectral.setRuleset(rules);
    var binded = {};
    await spectral.run(myDocument).then(results => {
        binded.rules = spectral.ruleset.rules;
        binded.results = results;
    });
    return binded;
}

exports.validator = () => {
    const validate = async (specFilePath, ruleSetFilePath) => {
        var ret = {};
        await linter(specFilePath, ruleSetFilePath).then(linterResult => {
            ret = linterResult;
        });
        return ret;
    };
    return (
        validate
    );
}


