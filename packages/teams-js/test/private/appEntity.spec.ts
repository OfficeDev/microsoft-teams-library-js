import { appEntity } from '../../src/private/appEntity';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { Utils } from '../utils';

describe('appEntity', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('selectAppEntity', () => {
    it('should throw not supported on platform error if appEntity capability is not supported', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      // eslint-disable-next-line @typescript-eslint/no-empty-function
      expect(appEntity.selectAppEntity('', [], '', () => {})).toThrow(errorNotSupportedOnPlatform);
    });
  });
});
