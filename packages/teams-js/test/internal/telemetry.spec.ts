import { getLogger, isFollowingApiVersionTagFormat } from '../../src/internal/telemetry';

describe('telemetry', () => {
  describe('getLogger', () => {
    it('returns a logger namespaced under the top-level teamsJs namespace', () => {
      const logger = getLogger('someComponent');
      expect(logger.namespace).toBe('teamsJs:someComponent');
    });

    it('returns a distinct logger for each namespace', () => {
      const first = getLogger('firstComponent');
      const second = getLogger('secondComponent');
      expect(first).not.toBe(second);
      expect(first.namespace).toBe('teamsJs:firstComponent');
      expect(second.namespace).toBe('teamsJs:secondComponent');
    });

    it('composes nested namespaces when the returned logger is extended', () => {
      const logger = getLogger('parentComponent').extend('childComponent');
      expect(logger.namespace).toBe('teamsJs:parentComponent:childComponent');
    });
  });

  describe('isFollowingApiVersionTagFormat', () => {
    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v0' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v0');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v1' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v1');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v123' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v123');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'something' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('something');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag '' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v12_' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v12_');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v12_apiName' - expect true", () => {
      const result = isFollowingApiVersionTagFormat('v12_apiName');
      expect(result).toBe(true);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v1_apiName2' - expect true", () => {
      const result = isFollowingApiVersionTagFormat('v1_apiName2');
      expect(result).toBe(true);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'v_apiName3' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('v_apiName3');
      expect(result).toBe(false);
    });

    it("test isFollowingApiVersionTagFormat with apiVersionTag 'V4_apiName4' - expect false", () => {
      const result = isFollowingApiVersionTagFormat('V4_apiName4');
      expect(result).toBe(false);
    });
  });
});
