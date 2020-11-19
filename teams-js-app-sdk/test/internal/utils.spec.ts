import { compareSDKVersions } from '../../src/internal/utils';

describe('utils', () => {

  test("compareSDKVersions", () => {
    expect(compareSDKVersions('1.2', '1.2.0')).toEqual(0);
    expect(compareSDKVersions('1.2a', '1.2b')).toEqual(NaN);
    expect(compareSDKVersions('1.2', '1.3')).toEqual(-1);
    expect(compareSDKVersions('2.0', '1.3.2')).toEqual(1);
  });
});
