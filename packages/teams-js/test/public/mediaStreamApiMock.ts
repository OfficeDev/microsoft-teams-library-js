// Jest doesn't support MediaStream API yet, so we need to mock it.
// Reference:
//   https://stackoverflow.com/questions/57424190/referenceerror-mediastream-is-not-defined-in-unittest-with-jest
//   https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom

// eslint-disable-next-line strict-null-checks/all
let transform;

Object.defineProperty(window, 'MediaStream', {
  value: jest.fn().mockImplementation((tracks: MediaStreamTrack[]) => ({
    getVideoTracks: () => tracks,
  })),

  writable: true,
});

Object.defineProperty(window, 'MediaStreamTrack', {
  value: jest.fn().mockImplementation(() => ({})),
  writable: true,
});

Object.defineProperty(window, 'ReadableStream', {
  value: jest.fn().mockImplementation(() => ({
    pipeThrough: () => ({
      pipeTo: () =>
        transform &&
        transform(
          /* mock VideoFrame */
          {
            timestamp: 0,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            close: () => {},
          },
          /* mock TransformStreamDefaultController */
          {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            enqueue: () => {},
          },
        ),
    }),
  })),
  writable: true,
});

Object.defineProperty(window, 'WritableStream', {
  value: jest.fn().mockImplementation(() => ({})),
  writable: true,
});

Object.defineProperty(window, 'MediaStreamTrackProcessor', {
  value: jest.fn().mockImplementation(() => ({
    readable: new ReadableStream(),
  })),
  writable: true,
});

Object.defineProperty(window, 'MediaStreamTrackGenerator', {
  value: jest.fn().mockImplementation(() => ({
    writable: new WritableStream(),
  })),
  writable: true,
});

Object.defineProperty(window, 'TransformStream', {
  value: jest.fn().mockImplementation((transformer) => (transform = transformer.transform)),
  writable: true,
});
