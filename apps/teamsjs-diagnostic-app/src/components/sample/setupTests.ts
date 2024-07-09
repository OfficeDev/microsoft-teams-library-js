import '@testing-library/jest-dom';

beforeAll(() => {
  console.log('Mocking window.location');
  const mockLocation = (new URL('http://localhost/') as unknown) as Location;

  jest.spyOn(window, 'location', 'get').mockReturnValue(mockLocation);

  Object.defineProperty(window.location, 'assign', {
    configurable: true,
    value: jest.fn(),
  });

  Object.defineProperty(window.location, 'reload', {
    configurable: true,
    value: jest.fn(),
  });

  Object.defineProperty(window.location, 'replace', {
    configurable: true,
    value: jest.fn(),
  });

  console.log('window.location mocked successfully');
});

export {};
