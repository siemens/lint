export default (targetVal, options) => {
    if (typeof targetVal !== 'object' || targetVal == null) return;
    const results = [];
    if (typeof targetVal["headers"] == 'undefined'){
        results.push({message: "Response should have headers for Api-Version"})
    }
    else if (typeof targetVal["headers"][options['property']] == 'undefined'){
        results.push({message: "A header with full semantic version value MUST be returned in the response with 'Api-Version: <MAJOR>.<MINOR>.<PATCH>'"})
    }
    return results;
};