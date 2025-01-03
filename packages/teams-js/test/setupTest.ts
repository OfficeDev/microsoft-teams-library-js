import { validOriginsFallback } from '../src/internal/constants';

global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
    ok: true,
    json: async () => {
      return { validOriginsFallback };
    },
  } as Response),
);
