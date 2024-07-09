import '@testing-library/jest-dom';

beforeAll(() => {
  try {
    console.log('Mocking window.location');
    const location = {
      assign: jest.fn(),
      href: 'http://localhost/',
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

    delete (window as any).location;

    Object.defineProperty(window, 'location', {
      value: location,
      writable: true,
    });
    console.log('window.location mocked successfully');
  } catch (error) {
    console.error('Error setting up window.location mock:', error);
  }
});

export {};
