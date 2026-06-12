export default (targetValue) => {
  const results = [];
  var exist = false;
  for(var key in targetValue){
    if (key.match("^2\\d\\d$")){
      exist = true;
    }
  }
  if (!exist){
    results.push({message: "API MUST respond successful response with 2xx success status code"})
  }
  return results;
};
