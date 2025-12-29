'use strict';

const assertObjectSchema = (schema) => {
  var exist = false;
  for(var key in schema.properties)
  {
    if (key === "data"){
      exist = true;
      break;
    }
  }
  if (!exist && !schema.$ref) {
    throw 'A request document SHOULD contain at least data property';
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
