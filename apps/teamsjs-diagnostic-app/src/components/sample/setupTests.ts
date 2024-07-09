import '@testing-library/jest-dom';

beforeAll(() => {
  console.log('Mocking window.location');

  // Mock location properties
  const mockLocation = {
    href: 'http://localhost/',
    assign: jest.fn(),
    reload: jest.fn(),
    replace: jest.fn(),
    origin: 'http://localhost',
    pathname: '',
    search: '',
    hash: '',
    host: 'localhost',
    hostname: 'localhost',
    protocol: 'http:',
    port: '',
  };

  Object.defineProperty(window, 'location', {
    value: mockLocation,
    writable: true,
  });

  console.log('window.location mocked successfully');
});

export {};
