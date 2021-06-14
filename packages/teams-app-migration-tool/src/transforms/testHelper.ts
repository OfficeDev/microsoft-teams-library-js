import { defineTest } from 'jscodeshift/dist/testUtils';

jest.autoMockOff();
const testOptions = {
  parser: 'js',
};
const options = null;
/**
 * wrapper around jscodeshift defineTest()
 * @param transformName
 * @param testList
 */
export function testHelper(dirName: string, transformName: string, testList: string[]): void {
  testList.forEach((test: string) => {
    defineTest(dirName, transformName, options, test, testOptions);
  });
}
