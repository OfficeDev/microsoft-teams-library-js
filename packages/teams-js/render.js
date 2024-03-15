const Mustache = require('mustache');
var fs = require('fs');

function get(file) {
  return fs.readFileSync(file).toString();
}

var data = JSON.parse(get('./tools/capabilityJson/fhl.json'));

var template = get('./tools/mustacheTemplates/capability.mustache');

var partials = {
  interface: get('./tools/mustacheTemplates/interface.mustache'),
  returnFunction: get('./tools/mustacheTemplates/returnFunction.mustache'),
  fireAndForgetFunction: get('./tools/mustacheTemplates/fireAndForgetFunction.mustache'),
  parameterList: get('./tools/mustacheTemplates/parameterList.mustache'),
  functionComment: get('./tools/mustacheTemplates/functionComment.mustache'),
  functionValidation: get('./tools/mustacheTemplates/functionValidation.mustache'),
  namespace: get('./tools/mustacheTemplates/namespace.mustache'),
  subcapability: get('./tools/mustacheTemplates/subcapability.mustache'),
  dataForHost: get('./tools/mustacheTemplates/dataForHost.mustache'),
  hostReturnHandling: get('./tools/mustacheTemplates/hostReturnHandling.mustache'),
  placeholders: get('./tools/mustacheTemplates/placeholders.mustache'),
  serializedFrom: get('./tools/mustacheTemplates/serializedFrom.mustache'),
};

function functionListUpdate(functionList) {
  if (functionList === undefined) {
    return;
  }

  functionList.forEach((entry) => {
    // This looks a bit silly, but lets mustache format comma separate lists correctly without requiring
    // json authors to go remember to put `"last": true` on the last item in each parameter list.
    if (entry.requiredParameters !== undefined) {
      entry.requiredParameters[entry.requiredParameters.length - 1].last = true;
    }
    if (entry.optionalParameters !== undefined) {
      entry.optionalParameters[entry.optionalParameters.length - 1].last = true;
    }
    // If there are both required and optional parameter lists, we need to add a runtime property so that
    // we know to combine the two lists using a comma in parameter lists
    if (entry.requiredParameters && entry.optionalParameters) {
      entry.needToCombineParameterLists = true;
    }

    if (entry.dataForHost !== undefined) {
      entry.dataForHost[entry.dataForHost.length - 1].last = true;
    }
  });
}

function dataForHostUpdate(fullData) {
  if (fullData.dataForHost !== undefined) {
    fullData.dataForHost[fullData.dataForHost.length - 1].last = true;
  }
}

functionListUpdate(data.exportedReturnFunctions);
functionListUpdate(data.exportedFireAndForgetFunctions);
dataForHostUpdate(data);

// Build up arrays of each capability higher in the hierarchy that needs to be supported
// and then add it to the JSON object we are going to process.
// It would be silly to make people add things to their json like:
// `requiresSupport: ["geoLocation", "geoLocation.getCurrentPosition"]` by hand in my opinion.
function buildUpOtherRequiredCapabilities(jsonObject, needsToBeSupported, currentCapability = undefined) {
  var capabilityName = currentCapability
    ? `${currentCapability}.${jsonObject.capabilityName}`
    : jsonObject.capabilityName;
  needsToBeSupported.push(capabilityName);
  // Make a copy of the array so we don't end up with identical arrays for each subcapability
  jsonObject.needsToBeSupported = [...needsToBeSupported];
  if (jsonObject.subcapabilities) {
    jsonObject.subcapabilities.forEach((subcapability) => {
      buildUpOtherRequiredCapabilities(subcapability, needsToBeSupported, capabilityName);
    });
  } else {
    jsonObject.subcapabilities = false;
  }
}

buildUpOtherRequiredCapabilities(data, [], undefined);

// Uncomment if you want to see what we turn the data into after processing it and before using it to
// render mustache templates
// process.stdout.write(JSON.stringify(data));

process.stdout.write(Mustache.render(template, data, partials));
