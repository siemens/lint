const jp = require('jsonpath')

const isCollectionResponse = (schema) => {
  var props = jp.query(schema, '$.responses.*..data');
  if (props.length>0){
    if ( props[0].type == 'array') {
      return true;
    }
  }
  return false;
};

export default (targetValue, options) => {
    if (isCollectionResponse(targetValue)){
        if(targetValue.parameters == null || targetValue.parameters.filter((r) => r.in === 'query' && r.name === options).length == 0){
            return [{message: 'API MAY provide projection of '+ options +' in response'}];
        }
    }
};