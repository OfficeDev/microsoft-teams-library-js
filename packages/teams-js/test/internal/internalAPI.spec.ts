import { isFollowApiVersionLabelFormat } from '../../src/internal/internalAPIs';

describe('isFollowApiVersionLabelFormat', () => {
  it("test isFollowApiVersionLabelFormat with apiVersion 'v' - expect false", () => {
    const result = isFollowApiVersionLabelFormat('v');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionLabelFormat with apiVersion 'v0' - expect true", () => {
    const result = isFollowApiVersionLabelFormat('v0');
    expect(result).toBe(true);
  });

  it("test isFollowApiVersionLabelFormat with apiVersion 'v1' - expect true", () => {
    const result = isFollowApiVersionLabelFormat('v1');
    expect(result).toBe(true);
  });

  it("test isFollowApiVersionLabelFormat with apiVersion 'v123' - expect true", () => {
    const result = isFollowApiVersionLabelFormat('v123');
    expect(result).toBe(true);
  });

  it("test isFollowApiVersionLabelFormat with apiVersion 'something' - expect false", () => {
    const result = isFollowApiVersionLabelFormat('something');
    expect(result).toBe(false);
  });

  it("test isFollowApiVersionLabelFormat with apiVersion '' - expect false", () => {
    const result = isFollowApiVersionLabelFormat('');
    expect(result).toBe(false);
  });
});
