'use strict';

const validateResource = (resource) => {
  if (! /^([a-z][a-z0-9]*)((-)[a-z0-9]+)*$/ .test(resource)){
    throw "Resource names SHOULD be in lowercase with hyphen";
  }
}

const check = (path) => {
  if (path == null) {
    return;
  }
  var resources = path.split('/');
  for (let index = 0; index < resources.length; index++) {
    const element = resources[index];
    if (element.length > 0 && !element.startsWith('{') && !element.endsWith('}'))
    {
      validateResource(element);
    }
  }
};

export default (targetValue) => {
  if (targetValue == null) return;
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
