export default (targetVal, options) => {
    if (typeof targetVal !== 'object' || targetVal == null) return;
    const results = [];
    if (targetVal.parameters == null){
        results.push({message: 'No parameters provided.'})
        return results;
    }
    var params = targetVal.parameters;
    var exist = false;
    for (const param of params){
        for (const ops of options){
            if (param[ops['property']] === ops['value'] && param['in'] === "header"){
                exist = true;
            }
        }
    }
    if (!exist){
        results.push({message: 'No header parameter provided in the options'})
    }
    return results;
};