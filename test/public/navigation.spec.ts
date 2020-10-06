import { Utils } from '../utils';
import { navigation } from '../../src/public/navigation';

describe('navigation', () => {
  // Use to send a mock message from the app.

  const utils = new Utils();

  describe('returnFocus', () => {
    it('should successfully returnFocus', () => {
      utils.initializeWithContext('content');

      navigation.returnFocus(true);

      let returnFocusMessage = utils.findMessageByFunc('navigation.returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
});
