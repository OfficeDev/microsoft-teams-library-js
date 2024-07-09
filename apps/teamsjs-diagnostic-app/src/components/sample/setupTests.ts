import '@testing-library/jest-dom'

beforeAll(() => {
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
    Object.defineProperty(window, 'location', {
      value: location,
      writable: true,
    });
  });
  
  export {};
