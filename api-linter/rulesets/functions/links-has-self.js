'use strict';
const jp = require('jsonpath')

const checkSelf = (link) => {
  if (link["self"] == null){
    throw 'self property not found in links object';
  }
}

const assertLinkSchema = (schema) => {
  const paths = jp.paths(schema, '$..*..links.properties');

  for (const path of paths) {
    const pathString = path.join('.');
    if (path.some(p => p === 'relationships')) {
      continue;
    }
    const link = jp.value(schema, jp.stringify(path));
    checkSelf(link);
  }
};

const check = (schema) => {
  const combinedSchemas = [...(schema.anyOf || []), ...(schema.oneOf || []), ...(schema.allOf || [])];
  if (combinedSchemas.length > 0) {
    combinedSchemas.filter(s => typeof s === 'object' && s !== null).forEach(check);
  } else {
    assertLinkSchema(schema);
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
