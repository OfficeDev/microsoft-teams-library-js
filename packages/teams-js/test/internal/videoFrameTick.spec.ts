import { VideoFrameTick } from '../../src/internal/videoFrameTick';
jest.useFakeTimers();
describe('videoFrameTick', () => {
  describe('setTimeout', () => {
    it('should invoke callback after timeout', () => {
      const callback = jest.fn();
      const timeoutInMs = 1000;
      const id = VideoFrameTick.setTimeout(callback, timeoutInMs);
      expect(callback).not.toBeCalled();
      jest.advanceTimersByTime(timeoutInMs);
      VideoFrameTick.tick();
      expect(callback).toBeCalled();
      expect(id).toBeDefined();
    });

    it('should not invoke callback before timeout', () => {
      const callback1 = jest.fn();
      const timeoutInMs1 = 1000;
      const callback2 = jest.fn();
      const timeoutInMs2 = 2000;
      VideoFrameTick.setTimeout(callback1, timeoutInMs1);
      VideoFrameTick.setTimeout(callback2, timeoutInMs2);
      jest.advanceTimersByTime(timeoutInMs1);
      VideoFrameTick.tick();
      expect(callback1).toBeCalled();
      expect(callback2).not.toBeCalled();
    });

    it('should not invoke callback when it is cleared before timeout', () => {
      const callback = jest.fn();
      const timeoutInMs = 1000;
      const id = VideoFrameTick.setTimeout(callback, timeoutInMs);
      VideoFrameTick.clearTimeout(id);
      jest.advanceTimersByTime(timeoutInMs);
      VideoFrameTick.tick();
      expect(callback).not.toBeCalled();
    });

    it('should involek callback only once', () => {
      const callback = jest.fn();
      const timeoutInMs = 1000;
      VideoFrameTick.setTimeout(callback, timeoutInMs);
      expect(callback).not.toBeCalled();
      jest.advanceTimersByTime(timeoutInMs);
      VideoFrameTick.tick();
      expect(callback).toBeCalled();
      jest.advanceTimersByTime(timeoutInMs);
      VideoFrameTick.tick();
      expect(callback).toBeCalledTimes(1);
    });
  });
  describe('setInterval', () => {
    it('should invoke callback after interval', () => {
      const callback = jest.fn();
      const intervalInMs = 1000;
      VideoFrameTick.setInterval(callback, intervalInMs);
      expect(callback).not.toBeCalled();
      for (let i = 1; i <= 100; i++) {
        jest.advanceTimersByTime(intervalInMs);
        VideoFrameTick.tick();
        expect(callback).toBeCalledTimes(i);
        VideoFrameTick.tick();
        expect(callback).toBeCalledTimes(i);
      }
    });
  });
});
