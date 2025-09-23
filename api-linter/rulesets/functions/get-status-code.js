'use strict';
const jp = require('jsonpath')

const checkObjectSchema = (schema, options) => {
  var props = jp.query(schema, '$..*..data');
  if (props.length > 0){
    if (options == 'individual' && props[0].type == null 
        && props[0].allOf != null && props[0].allOf.length > 0 
        && props[0].allOf[0] != null && props[0].allOf[0].type == 'object') {
      return true;
    }
    else if (options == 'collection' && props[0].type == 'array') {
      return true;
    }
  }
  return false;
};

const check = (object, options) => {
  var schemas = jp.query(object, '$..content..schema');
  var has = false;
  if (schemas.length > 0){
    schemas.filter(schema => typeof schema === 'object' && schema !== null).forEach(schema => {
      has = has || checkObjectSchema(schema, options);
    })
  }
  return has;
};

export default (targetValue, options) => {
  if (typeof targetValue !== 'object' || targetValue == null) return;
  const results = [];
  if (options=='individual' && check(targetValue, options)){
    if(typeof targetValue['200'] == 'undefined'){
      results.push({message: "A Successful fetch of individual resources MUST return the status code 200"})
    }
  }
  else if(options=='collection' && check(targetValue, options)){
    var exist = false;
    for(var key in targetValue){
      if (key.match("^2\\d\\d$")){
        exist = true;
      }
    }
    if (!exist){
      results.push({message: "A successful fetch of resource collection request MUST return a 2xx status code"})
    }
  }
  return results;
};
