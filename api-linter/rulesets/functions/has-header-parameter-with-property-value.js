/**
 * Copyright Siemens 2026.
 * SPDX-License-Identifier: MIT
 */

export default (targetVal, options) => {
  if (typeof targetVal !== 'object' || targetVal == null) return;
  const results = [];
  if (targetVal.parameters == null) {
    results.push({ message: 'No parameters provided.' });
    return results;
  }

  const params = targetVal.parameters;
  const required = new Set(options.map(o => o.value));

  for (const param of params) {
    if (param.in !== 'header') continue;
    for (const ops of options) {
      if (param[ops.property] === ops.value) {
        required.delete(ops.value);
      }
    }
  }

  if (required.size > 0) {
    results.push({
      message: `Missing required header parameter(s): ${Array.from(required).join(', ')}`
    });
  }
  return results;
};
