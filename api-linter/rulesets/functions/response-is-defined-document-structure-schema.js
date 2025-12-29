'use strict';

const assertObjectSchema = (schema) => {
  var doc_structure = ["data", "errors", "meta", "links"];
  var exist = false;
  for(var key in schema.properties)
  {
    if (doc_structure.includes(key)){
      exist = true;
      break;
    }
  }
  if (!exist) {
    throw 'A response document SHOULD contain at least one of the following top-level members:data,errors,meta,links.';
  }
};

const check = (schema) => {
  const combinedSchemas = [...(schema.anyOf || []), ...(schema.oneOf || []), ...(schema.allOf || [])];
  if (combinedSchemas.length > 0) {
    combinedSchemas.filter(s => typeof s === 'object' && s !== null).forEach(check);
  } else {
    assertObjectSchema(schema);
  }
};

export default (targetValue) => {
  if (typeof targetValue !== 'object' || targetValue == null) return;
  try {
    check(targetValue);
  } catch (ex) {
    return [
      {
        message: ex,
      },
    ];
  }
};
