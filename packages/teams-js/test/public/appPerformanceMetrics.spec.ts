import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { MessageRequest } from '../../src/internal/messageObjects';
import { app } from '../../src/public';
import * as appPerformanceMetrics from '../../src/public/appPerformanceMetrics';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/**
 * Configuration for framed and frameless tests
 */
type Configuration = {
  type: 'Framed' | 'Frameless';
  setupUtils: (utils: Utils) => void;
  respondToMessage: (utils: Utils, message: MessageRequest, ...args: unknown[]) => Promise<void>;
};

/**
 * Test configurations for framed and frameless
 */
const TEST_CONFIGURATION: Configuration[] = [
  {
    type: 'Framed',
    setupUtils: (utils: Utils) => {
      utils.processMessage = null;
      utils.messages = [];
      utils.childMessages = [];
      utils.childWindow.closed = false;
      utils.mockWindow.parent = utils.parentWindow;
      utils.setRespondWithTimestamp(false);

      // Set a mock window for testing
      app._initialize(utils.mockWindow);
    },
    respondToMessage: (utils: Utils, message: MessageRequest, ...args: unknown[]) =>
      utils.sendMessage(message.func, ...args),
  },
  {
    type: 'Frameless',
    setupUtils: (utils: Utils) => {
      utils.mockWindow.parent = undefined as unknown as Window;
      utils.messages = [];
      utils.setRespondWithTimestamp(false);
      app._initialize(utils.mockWindow);
      GlobalVars.isFramelessWindow = false;
    },
    respondToMessage: (utils: Utils, message: MessageRequest, ...args: unknown[]) =>
      new Promise((resolve) =>
        resolve(
          utils.respondToFramelessMessage({
            data: {
              func: message.func,
              args,
            },
          } as DOMMessageEvent),
        ),
      ),
  },
];

describe('Testing appPerformanceMetrics', () => {
  let utils: Utils;

  TEST_CONFIGURATION.forEach((configuration) => {
    describe(`${configuration.type} test`, () => {
      beforeEach(() => {
        utils = new Utils();
        configuration.setupUtils(utils);
      });

      afterEach(() => {
        utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
        app._uninitialize();
        GlobalVars.isFramelessWindow = false;
      });

      describe('registerHostMemoryMetricsHandler', () => {
        it('Should not allow calls before initialization', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          expect(() => appPerformanceMetrics.registerHostMemoryMetricsHandler(() => {})).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        it('Registered function should get called when host sends memory metrics', async () => {
          await utils.initializeWithContext('content');

          const handler = jest.fn();
          appPerformanceMetrics.registerHostMemoryMetricsHandler(handler);

          const mockMemoryMetrics = {
            isCached: false,
            isPrecached: false,
            isSharingProcess: false,
            totalFrameWorkingSetSizeKB: 1024,
            totalFrameCommitSizeKB: 2048,
            frameMemoryMetrics: [],
          };

          await configuration.respondToMessage(
            utils,
            {
              func: 'appPerformanceMetrics.memoryUsageHeartbeat',
            },
            mockMemoryMetrics,
          );
          expect(handler).toBeCalledWith(mockMemoryMetrics);
        });

        it('Should replace previously registered handler', async () => {
          await utils.initializeWithContext('content');

          const handlerOne = jest.fn();
          appPerformanceMetrics.registerHostMemoryMetricsHandler(handlerOne);
          const handlerTwo = jest.fn();
          appPerformanceMetrics.registerHostMemoryMetricsHandler(handlerTwo);

          const mockMemoryMetrics = {
            isCached: false,
            isPrecached: false,
            isSharingProcess: false,
            totalFrameWorkingSetSizeKB: 1024,
            totalFrameCommitSizeKB: 2048,
            frameMemoryMetrics: [],
          };

          await configuration.respondToMessage(
            utils,
            {
              func: 'appPerformanceMetrics.memoryUsageHeartbeat',
            },
            mockMemoryMetrics,
          );
          expect(handlerTwo).toBeCalledWith(mockMemoryMetrics);
          expect(handlerOne).not.toBeCalled();
        });

        it('app.registerHostMemoryMetricsHandler should send registerHandler message to host', async () => {
          await utils.initializeWithContext('content');

          const handler = jest.fn();
          appPerformanceMetrics.registerHostMemoryMetricsHandler(handler);

          const registerHandlerMessage = utils.findMessageByFunc('registerHandler');
          expect(registerHandlerMessage).not.toBeNull();
          expect(registerHandlerMessage!.args!.length).toBe(1);
          expect(registerHandlerMessage!.args![0]).toBe('appPerformanceMetrics.memoryUsageHeartbeat');
        });
      });
    });
  });
});
