const {pattern} = require('@stoplight/spectral-functions')

const apiVersioning = global.apiVersioning;
const hasPropertyValue = (targetVal, options) => {
    const results = [];
    var exist = false;
    for (const param of targetVal){
        if (param[options['property']] === options['value']){
            exist = true;
        }
    }
    if (!exist){
        results.push({message: 'A request header Api-Version MUST be supported to allow client to specify the version.'})
    }
    return results;
};

const hasProperty = (targetVal, options) => {
    const results = [];
    if (typeof targetVal["headers"] == 'undefined'){
        results.push({message: "Response should have headers for Api-Version"})
    }
    else if (typeof targetVal["headers"][options['property']] == 'undefined'){
        results.push({message: "A header with full semantic version value MUST be returned in the response with 'Api-Version: <MAJOR>.<MINOR>.<PATCH>'"})
    }
    return results;
};

var ruleset = {};
switch (apiVersioning){
   case "ignore":
      ruleset.rules = {}
      break;
   case "url":
      ruleset.rules = {
         "Siemens-API-[200.1]": {
            message: "The Major version number MUST be specified in the URI as a path segment",
            description: "The Major version number MUST be specified in the URI as a path segment.",
            documentationUrl: "https://developer.internal.siemens.com/guidelines/api-guidelines/rest/versioning.html#versioningrule200.1",
            severity: "error",
            given: [
               "$.servers..url"
            ],
            then: {
               function: pattern,
               functionOptions: {
                  match: "/[\\.|\\/|](v)?[0-9]+/i",
                  notMatch: "/[\\.|\\/|](v)?[0-9]+\\.[0-9]+/i"
               }
            }
         }
      }
      break;
   case "header":
      ruleset.rules = {
         "Siemens-API-[200.2]": {
            message: "{{message}}",
            description: "A request HTTP header e.g., Api-Version Should be supported to allow client to specify the version.",
            documentationUrl: "https://developer.internal.siemens.com/guidelines/api-guidelines/rest/versioning.html#versioningrule200.2",
            severity: "error",
            given: [
               "$.paths[*]..parameters"
            ],
            then: {
               function: hasPropertyValue,
               functionOptions: {
                  property: "name",
                  value: "Api-Version"
               }
            }
         }
      }
      break;
   default:
      break;
}
if (apiVersioning == 'url' || apiVersioning == 'header'){
   ruleset.rules["Siemens-API-[201]"] = {
      message: "{{message}}",
      description: "A header with full semantic version value SHOULD be returned in the response with 'Api-Version: <MAJOR>.<MINOR>.<PATCH>'",
      documentationUrl: "https://developer.internal.siemens.com/guidelines/api-guidelines/rest/versioning.html#versioningrule201",
      severity: "warn",
      given: [
         "$.paths..responses[?(@.content)]"
      ],
      then: {
         function: hasProperty,
         functionOptions: {
            property: "Api-Version"
         }
      }
   }
}
export default ruleset;