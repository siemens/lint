export default (targetValue, options) => {
    if (targetValue == null) return;
    var checkField = options.nameCheck != null;
    var queryParameterCount = targetValue.filter((r) => r.in === 'query').length;
    var hasFilter = targetValue.filter((r) => r.in === 'query' && r.name === 'filter').length > 0;
    if (((queryParameterCount > options.max && !hasFilter) || (hasFilter && queryParameterCount -1 > options.max)) && !checkField){
        return [{message: 'API MAY not support more than '+ options.max +
            ' parameters at once for selecting resources. ' + 
            '(Linter is unable to determine whether the parameter belongs to the filtering condition or not.) '
        }];
    }
    if (queryParameterCount > options.max && checkField && !hasFilter){
        return [{message: "The query parameter 'filter' SHOULD be used to filter or query data. " + 
            "(Lint is unable to determine whether the parameters used for filtering or not.) " 
        }];
    }
};
  