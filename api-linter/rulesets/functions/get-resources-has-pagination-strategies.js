const jp = require('jsonpath')

const isCollectionResponse = (schema) => {
  var props = jp.query(schema, '$.properties.data');
  if (props.length>0){
    if ( props[0].type == 'array') {
      return true;
    }
  }
  return false;
};

const hasTopLink = (schema) => {
  var props = jp.query(schema, '$.properties.links');
  if (props.length>0){
    return true;
  }
  return false;
};

const pageLinkKeys = ["first", "last", "prev", "next"];

const hasPageLinkKeys = (prob) => {
  var has = false;
  pageLinkKeys.forEach(key => {
    if(key in prob) {
      has = true;
    }
  });
  return has;
}

const followCursorBasedStrategies = (requestQueryParameters) =>{
  return requestQueryParameters.filter(param => param.name == 'cursor' || param.name == 'limit').length == 2;
}

const followOffsetBasedStrategies = (requestQueryParameters) =>{
  return requestQueryParameters.filter(param => param.name == 'offset' || param.name == 'limit').length == 2;
}

const followIndexBasedStrategies = (requestQueryParameters) =>{
  return requestQueryParameters.filter(param => param.name == 'number' || param.name == 'size').length == 2;
}

export default (targetValue) => {
  var responseSchema = jp.query(targetValue, '$.responses..schema');
  if (responseSchema.length > 0){
    var schema = responseSchema[0];
    if (isCollectionResponse(schema) && hasTopLink(schema)){
      var linkProps = jp.query(schema, '$.properties.links.properties');
      if (linkProps.filter(prob => hasPageLinkKeys(prob)).length > 0 ){
        var requestQueryParameters = jp.query(targetValue, "$.parameters[?(@.in=='query')]");
        if (requestQueryParameters.length == 0 || !(followCursorBasedStrategies(requestQueryParameters) 
          || followOffsetBasedStrategies(requestQueryParameters) || followIndexBasedStrategies(requestQueryParameters))){
          return [{message: 'Pagination SHOULD be implemented using query parameters.'}];
        }
      }
    }
  }
};