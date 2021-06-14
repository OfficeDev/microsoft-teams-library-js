import { testHelper } from '../testHelper';

const testList = ['test'];

const transformName = 'test-packages';
const dirName = __dirname;

/**
 * run tests on an empty transform for testing environment
 */
testHelper(dirName, transformName, testList);
