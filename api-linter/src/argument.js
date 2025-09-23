'use strict';
const { Command, Option } = require("commander");

exports.argument = () => {
    const program = new Command();

    program.name("api-linter")
        .requiredOption("-s, --specPath <openapi spec>", "path to openapi specification")
        .requiredOption("-r, --rulesetPath <rule file>", "path to ruleset file")
        .addOption(new Option("-f, --failSeverity <fail severity>", "fail severity").default("warn"))
        .addOption(new Option("-c, --consoleSeverity <console severity>", "console output severity").default("warn"))
        .addOption(new Option("-o, --outputFilename <output filename>", "output filename").default("linter-result.html"))
        .addOption(new Option("-p, --jsonFile <output json file>", "output json file").default("spectral_result.json"))
        .addOption(new Option("-v, --apiVersioning <api versioning>", "api versioning")
            .choices(["ignore", "url", "header"])
            .default("ignore"))
        .addOption(new Option("-a, --apiSecurity <api security>", "api security")
            .choices(["y","yes","t","true","n","no","f","false"])
            .default("n"))
        .option("--resolve", "follow external $refs (same as Spectral --resolve)", false);

    program.parse(process.argv);

    const options = program.opts();
    const { specPath, rulesetPath, failSeverity, consoleSeverity,
            apiVersioning, apiSecurity, outputFilename, resolve, jsonFile } = options;
    global.apiVersioning = apiVersioning;
    global.apiSecurity = apiSecurity;
    return ({
        specPath,
        rulesetPath,
        failSeverity,
        consoleSeverity,
        apiVersioning,
        apiSecurity,
        outputFilename,
        resolve,
        jsonFile
    });
}