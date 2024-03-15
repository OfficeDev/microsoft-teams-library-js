var Validator = require('jsonschema').Validator;
var fs = require('fs');

function get(file) {
  return fs.readFileSync(file).toString();
}

var v = new Validator();

var schema = JSON.parse(get('./tools/capabilityJson/schemas/capability.schema.json'));
var data = JSON.parse(get('./tools/capabilityJson/geoLocation.json'));

var exportedInterfaceSchema = JSON.parse(get('./tools/capabilityJson/schemas/exportedInterface.schema.json'));
v.addSchema(exportedInterfaceSchema, '/ExportedInterface');

var exportedReturnFunctionSchema = JSON.parse(get('./tools/capabilityJson/schemas/exportedReturnFunction.schema.json'));
v.addSchema(exportedReturnFunctionSchema, '/ExportedReturnFunction');

var parameterSchema = JSON.parse(get('./tools/capabilityJson/schemas/parameter.schema.json'));
v.addSchema(parameterSchema, '/Parameter');

var dataForHostSchema = JSON.parse(get('./tools/capabilityJson/schemas/dataForHost.schema.json'));
v.addSchema(dataForHostSchema, '/DataForHost');

var dataFromHostSchema = JSON.parse(get('./tools/capabilityJson/schemas/dataFromHost.schema.json'));
v.addSchema(dataFromHostSchema, '/DataFromHost');

var exportedFireAndForgetSchema = JSON.parse(
  get('./tools/capabilityJson/schemas/exportedFireAndForgetFunction.schema.json'),
);
v.addSchema(exportedFireAndForgetSchema, '/ExportedFireAndForgetFunction');

var validatorResult = v.validate(data, schema);

if (validatorResult.errors.length > 0) {
  console.log(`Invalid capability JSON:\n\n${JSON.stringify(validatorResult.errors, null, 2)}`);
} else {
  console.log('Capability JSON is VALID');
}
