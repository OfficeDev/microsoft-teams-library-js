import { SimpleTypeResponseHandler } from '../../src/internal/responseHandler';

describe('ResponseHandler', () => {
  describe('BooleanResponseHandler', () => {
    describe('validate', () => {
      let handler: SimpleTypeResponseHandler<boolean> = new SimpleTypeResponseHandler();

      beforeEach(() => {
        handler = new SimpleTypeResponseHandler();
      });
      test('should always return true', () => {
        const resultWhenTrue = handler.validate(true);
        const resultWhenFalse = handler.validate(false);

        expect(resultWhenTrue).toBe(true);
        expect(resultWhenFalse).toBe(true);
      });
    });
    describe('deserialize', () => {
      let handler: SimpleTypeResponseHandler<boolean> = new SimpleTypeResponseHandler();

      beforeEach(() => {
        handler = new SimpleTypeResponseHandler();
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
