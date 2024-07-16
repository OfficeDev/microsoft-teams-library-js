Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost',
    pathname: '/mock-path',
    search: '',
    hash: '',
    origin: 'http://localhost',
    assign: jest.fn(),
  },
  writable: true,
});
