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

const pageLinkKeys = ["first", "last", "prev", "next", "self"];

const hasPageLinkKeys = (prob) => {
  var has = false;
  pageLinkKeys.forEach(key => {
    if(key in prob) {
      has = true;
    }
  });
  return has;
}

const notInPageKeys = (prob) => {
  const result = Object.keys(prob).filter(key => !pageLinkKeys.includes(key));
  return result.length > 0;
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

export default (targetValue, options) => {
  //valid only targetValue using pagination
  var requestQueryParameters = jp.query(targetValue, "$.parameters[?(@.in=='query')]");
  if (requestQueryParameters.length > 0 && (followCursorBasedStrategies(requestQueryParameters) 
    || followOffsetBasedStrategies(requestQueryParameters) || followIndexBasedStrategies(requestQueryParameters))){
      var response = jp.query(targetValue, '$.responses..schema');
    if (response.length > 0){
      var responseSchema = response[0];
      //optionA: A server MAY provide links to traverse a paginated data set
      //optionB: Pagination links SHOULD appear in the top-level links object.
      //optionC: Pagination links MUST preserve sorting and filtering.
      //optionD: Naming convention MUST be used for pagination keys.
      if (options == 'A'){
        if (isCollectionResponse(responseSchema) && !hasTopLink(responseSchema)){
          return [{message: 'A server MAY provide links to traverse a paginated data set'}];
        }
        else if (isCollectionResponse(responseSchema) && hasTopLink(responseSchema)){
          var linkProps = jp.query(responseSchema, '$.properties.links.properties');
          if (linkProps.filter(prob => hasPageLinkKeys(prob)).length == 0 ){
            return [{message: 'A server MAY provide links to traverse a paginated data set'}];
          }
        }
      }
      if (options == 'B') {
        if (isCollectionResponse(responseSchema) && hasTopLink(responseSchema)){
          var linkProps = jp.query(responseSchema, '$.properties.links.properties..properties');
          if (linkProps.filter(prob => hasPageLinkKeys(prob)).length > 0 ){
            return [{message: 'Pagination links SHOULD appear in the top-level links object.'}];
          }
        }
      }
      if (options == 'D') {
        if (isCollectionResponse(responseSchema) && hasTopLink(responseSchema)){
          var linkProps = jp.query(responseSchema, '$.properties.links.properties');
          if (linkProps.filter(prob => hasPageLinkKeys(prob)).length > 0 ){
            if (linkProps.filter(prob => notInPageKeys(prob)).length > 0){
              return [{message: 'Naming convention MUST be used for pagination keys.'}];
            }
          }
        }
      }
    }
  }
  
};