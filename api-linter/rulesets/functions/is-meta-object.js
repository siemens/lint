'use strict';

const assertObjectSchema = (schema) => {
  if (schema.type !== 'object') {
    throw 'Schema type is not `object`';
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
