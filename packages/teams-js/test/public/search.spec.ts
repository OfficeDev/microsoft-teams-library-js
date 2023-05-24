import { GlobalVars } from '../../src/internal/globalVars';
import { FrameContexts } from '../../src/public/constants';
import { M365ContentAction } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { search } from '../../src/public/search';
import { version } from '../../src/public/version';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Type guard to determine if an action item is of M365Content Type
 */
function isM365ContentType(actionItem: unknown): actionItem is M365ContentAction {
  // eslint-disable-next-line no-prototype-builtins
  return actionItem && Object.prototype.hasOwnProperty.call(actionItem, 'secondaryId');
}

describe('Testing search capability', () => {
  const mockErrorMessage = 'Something went wrong...';
  describe('Framed - Testing search capability', () => {
    // Use to send a mock message from the app.
    const utils = new Utils();

    beforeEach(() => {
      utils.processMessage = null;
      utils.messages = [];
      utils.childMessages = [];
      utils.childWindow.closed = false;
      utils.mockWindow.parent = utils.parentWindow;

      // Set a mock window for testing
      search._initialize(utils.mockWindow);
    });

    afterEach(() => {
      // Reset the object since it's a singleton
      if (search._uninitialize) {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        search._uninitialize();
      }
    });

    describe('Testing search.closeSearch function', () => {
      Object.values(FrameContexts).forEach((context) => {
        it(`search.closeSearch should successfully be called with no error by app developers from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          search.closeSearch();
          const message = utils.findMessageByFunc(search.Messages.CloseSearch);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });
  });

  describe('Frameless - Testing app capbility', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
      search._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
    });
    afterEach(() => {
      search._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });

    describe('Testing search.closeSearch function', () => {
      Object.values(FrameContexts).forEach((context) => {
        it(`search.closeSearch should successfully be called with no error by app developers from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          search.closeSearch();
          const message = utils.findMessageByFunc(search.Messages.CloseSearch);
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(version);
        });
      });
    });
  });
});
