var apiSecurity = global.apiSecurity;
const hasHeaderWithPropertyValue = (targetVal, options) => {
    const results = [];
    if (targetVal.parameters == null){
        results.push({message: 'No request header parameters provided.'})
        return results;
    }
    var exist = false;
    for (const param of targetVal.parameters){
        if (param[options['property']] === options['value'] && param['in'] === "header"){
            exist = true;
        }
    }
    if (!exist){
        results.push({message: 'A request header '+ options['value'] +' MUST be supported.'})
    }
    return results;
};

var ruleset = {};
if (typeof apiSecurity == 'undefined') {
    apiSecurity = "n";
}
switch (apiSecurity.toLowerCase()){
   case "y":
   case "t":
   case "true":
   case "yes":
      ruleset.rules = {
         "Siemens-API-Security": {
            message: "{{error}}",
            description: "When calling a secured REST API, the request header Authorization with the value Bearer <your JWT> MUST be present.",
            documentationUrl: "https://developer.siemens.com/guidelines/api-guidelines/rest/security.html",
            severity: "error",
            given: [
               "$.paths.*"
            ],
            then: {
               function: hasHeaderWithPropertyValue,
               functionOptions: {
                  property: "name",
                  value: "Authorization"
               }
            }
         }
      }
      break;
   case "ignore":
   case "n":
   case "no":
   case "f":
   case "false":
   default:
      ruleset.rules = {}
      break;
}
export default ruleset;