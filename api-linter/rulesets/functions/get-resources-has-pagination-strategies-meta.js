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

const checkCursorMeta = (meta) => {
  return jp.query(meta, '$.properties.page.properties.nextCursor').length > 0
}

const checkOffsetMeta = (meta) => {
  return jp.query(meta, '$.properties.page.properties.totalElements').length > 0
      && jp.query(meta, '$.properties.page.properties.offset').length > 0
      && jp.query(meta, '$.properties.page.properties.elements').length > 0
}

const checkIndexMeta = (meta) => {
  return jp.query(meta, '$.properties.page.properties.totalPages').length > 0
    && jp.query(meta, '$.properties.page.properties.number').length > 0
    && jp.query(meta, '$.properties.page.properties.size').length > 0
}

const checkIndexMeta2 = (meta) => {
  return jp.query(meta, '$.properties.page.properties.elements').length > 0
    && jp.query(meta, '$.properties.page.properties.totalElements').length > 0
}

export default (targetValue, options) => {
  var responseSchema = jp.query(targetValue, '$.responses..schema');
  if (responseSchema.length > 0){
    var schema = responseSchema[0];
    if (isCollectionResponse(schema) && hasTopLink(schema)){
      var linkProps = jp.query(schema, '$.properties.links.properties');
      if (linkProps.filter(prob => hasPageLinkKeys(prob)).length > 0 ){
        var requestQueryParameters = jp.query(targetValue, "$.parameters[?(@.in=='query')]");
        var responseMeta = jp.query(schema, "$.properties.meta");
        if (options == 'cursor' && requestQueryParameters.length > 0 && followCursorBasedStrategies(requestQueryParameters)){
          if (responseMeta.length == 0 || !checkCursorMeta(responseMeta[0])){
            return [{message: 'The server MAY provide information about the nextCursor that is required to fetch the next page in the meta.page.nextCursor property'}];
          }
        }
        if (options == 'offset' && requestQueryParameters.length > 0 && followOffsetBasedStrategies(requestQueryParameters)){
          if (responseMeta.length == 0 || !checkOffsetMeta(responseMeta[0])){
            return [{message: 'Server SHOULD provide pagination meta [meta.page.totalElements, meta.page.offset, meta.page.elements] information to the client'}];
          }
        }
        if (options == 'index1' && requestQueryParameters.length > 0 && followIndexBasedStrategies(requestQueryParameters)){
          if (responseMeta.length == 0 || !checkIndexMeta(responseMeta[0])){
            return [{message: 'Server SHOULD provide pagination meta [meta.page.totalPages, meta.page.number, meta.page.size] information to the client'}];
          }
        }
        if (options == 'index2' && requestQueryParameters.length > 0 && followIndexBasedStrategies(requestQueryParameters)){
          if (responseMeta.length == 0 || (checkIndexMeta(responseMeta[0]) && !checkIndexMeta2(responseMeta[0]))) {
            return [{message: 'Server SHOULD provide pagination meta [meta.page.elements, meta.page.totalElements] information to the client'}];
          }
        }
      }
    }
  }
};