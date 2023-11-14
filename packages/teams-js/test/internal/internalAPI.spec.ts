import { isFollowApiVersionTagFormat } from '../../src/internal/internalAPIs';

describe('isFollowApiVersionTagFormat', () => {
  it("test isFollowApiVersionTagFormat with apiVersionTag 'v' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v0' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v0');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v1' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v1');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v123' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v123');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'something' - expect false", () => {
    const result = isFollowApiVersionTagFormat('something');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag '' - expect false", () => {
    const result = isFollowApiVersionTagFormat('');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v12_' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v12_');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v12_apiName' - expect true", () => {
    const result = isFollowApiVersionTagFormat('v12_apiName');
    expect(result).toBe(true);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v1_apiName2' - expect true", () => {
    const result = isFollowApiVersionTagFormat('v1_apiName2');
    expect(result).toBe(true);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'v_apiName3' - expect false", () => {
    const result = isFollowApiVersionTagFormat('v_apiName3');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionTagFormat with apiVersionTag 'V4_apiName4' - expect false", () => {
    const result = isFollowApiVersionTagFormat('V4_apiName3');
    expect(result).toBe(false);
  });
});
