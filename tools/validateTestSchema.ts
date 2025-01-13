import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

const TEST_FILES_DIR = path.join(__dirname, '../apps/teams-test-app/e2e-test-data');
const SCHEMA_PATH = path.join(__dirname, '../apps/teams-test-app/capabilities.schema.json');

function validateTestFiles(): void {
  // Load and parse the schema
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateSchema: false,
  });
  const validate = ajv.compile(schema);

  // Get all JSON files in the test directory
  const testFiles = fs
    .readdirSync(TEST_FILES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.join(TEST_FILES_DIR, file));

  let hasErrors = false;

  // Validate each test file
  testFiles.forEach((filePath) => {
    try {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const testFile = JSON.parse(fileContents);
      const isValid = validate(testFile);

      if (!isValid && validate.errors) {
        hasErrors = true;
        const filename = path.basename(filePath);
        console.warn(`\n⚠️  ${filename}:`);

        // Only show unique property errors
        const uniqueErrors = new Set<string>();
        validate.errors.forEach((error) => {
          if (error.params?.additionalProperty) {
            uniqueErrors.add(`  ❌ Invalid property: "${error.params.additionalProperty}"`);
          } else if (error.params?.missingProperty) {
            uniqueErrors.add(`  ❌ Missing required property: "${error.params.missingProperty}"`);
          } else {
            uniqueErrors.add(`  ❌ ${error.instancePath}: ${error.message}`);
          }
        });

        uniqueErrors.forEach((error) => console.warn(error));
      }
    } catch (error) {
      hasErrors = true;
      console.warn(`\n⚠️  Error processing ${path.basename(filePath)}:`);
      console.warn(`  - ${error instanceof Error ? error.message : String(error)}`);
    }
  });

  if (hasErrors) {
    console.warn('\n⚠️  Some test files failed schema validation. Please review the warnings above.');
  } else {
    console.log('\n✅ All test files successfully validated against the schema.');
  }
}

// Run validation
validateTestFiles();
