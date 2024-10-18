import { BooleanResponseHandler } from '../../src/internal/responseHandler';

describe('ResponseHandler', () => {
  describe('BooleanResponseHandler', () => {
    describe('validate', () => {
      let handler: BooleanResponseHandler = new BooleanResponseHandler();

      beforeEach(() => {
        handler = new BooleanResponseHandler();
      });
      test('should always return true', () => {
        const resultWhenTrue = handler.validate(true);
        const resultWhenFalse = handler.validate(false);

        expect(resultWhenTrue).toBe(true);
        expect(resultWhenFalse).toBe(true);
      });
    });
    describe('deserialize', () => {
      let handler: BooleanResponseHandler = new BooleanResponseHandler();

      beforeEach(() => {
        handler = new BooleanResponseHandler();
      });
      test('should return the response as is', () => {
        const resultWhenTrue = handler.deserialize(true);
        const resultWhenFalse = handler.deserialize(false);

        expect(resultWhenTrue).toBe(true);
        expect(resultWhenFalse).toBe(false);
      });
    });
  });
});
