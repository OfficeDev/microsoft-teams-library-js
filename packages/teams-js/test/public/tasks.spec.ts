import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app } from '../../src/public/app';
import { minAdaptiveCardVersion, TaskModuleDimension } from '../../src/public/constants';
import { FrameContexts } from '../../src/public/constants';
import { TaskInfo } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { tasks } from '../../src/public/tasks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('tasks', () => {
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
    utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('startTask', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];

    it('should not allow calls before initialization', () => {
      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`should pass along the taskInfo correctly when card is specified. ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: { url: {}, card: { bot: {} }, update: {} } },
          });

          const taskInfo: TaskInfo = {
            card: 'someCard',
            fallbackUrl: 'someFallbackUrl',
            height: TaskModuleDimension.Large,
            width: TaskModuleDimension.Large,
            title: 'someTitle',
            url: 'someUrl',
            completionBotId: 'someCompletionBotId',
          };
          tasks.startTask(taskInfo, () => {
            return;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          expect(startTaskMessage.args).toEqual([taskInfo]);
        });

        it(`should pass along the taskInfo correctly when URL is not specified. ${context} context`, async () => {
          await utils.initializeWithContext(context);

          const taskInfo: TaskInfo = {
            height: TaskModuleDimension.Large,
            width: TaskModuleDimension.Large,
          };

          tasks.startTask(taskInfo, () => {
            return;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          expect(startTaskMessage.args).toEqual([taskInfo]);
        });

        it(`should pass along the taskInfo correctly when completionBotid is specified. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });

          const taskInfo: TaskInfo = {
            fallbackUrl: 'someFallbackUrl',
            height: TaskModuleDimension.Large,
            width: TaskModuleDimension.Large,
            title: 'someTitle',
            url: 'someUrl',
            completionBotId: 'someCompletionBotId',
          };

          tasks.startTask(taskInfo, () => {
            return;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          expect(startTaskMessage.args).toEqual([taskInfo]);
        });

        it(`should pass along the taskInfo correctly when URL is provided without Bot. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: { url: {}, card: {}, update: {} } },
          });

          const taskInfo: TaskInfo = {
            fallbackUrl: 'someFallbackUrl',
            height: TaskModuleDimension.Large,
            width: TaskModuleDimension.Large,
            title: 'someTitle',
            url: 'someUrl',
          };

          tasks.startTask(taskInfo, () => {
            return;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          expect(startTaskMessage.args).toEqual([taskInfo]);
        });

        it(`should Provide default Size if taskInfo doesn't have length or width. ${context} context`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: { url: {}, card: {}, update: {} } },
          });
          const taskInfo: TaskInfo = {
            fallbackUrl: 'someFallbackUrl',
            height: TaskModuleDimension.Large,
            url: 'someUrl',
            card: 'someCard',
          };

          tasks.startTask(taskInfo, () => {
            return;
          });
          const taskInfoWithSize = tasks.getDefaultSizeIfNotProvided(taskInfo);
          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');

          expect(startTaskMessage).not.toBeNull();
          expect(startTaskMessage.args).toEqual([taskInfo]);
          expect(startTaskMessage.args).toEqual([taskInfoWithSize]);
        });

        it(`should invoke callback with result. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          utils.setRuntimeConfig({
            apiVersion: 1,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: { url: {}, card: {}, update: {} } },
          });
          let callbackCalled = false;
          const taskInfo: TaskInfo = {};
          tasks.startTask(taskInfo, (err, result) => {
            expect(err).toBeNull();
            expect(result).toBe('someResult');
            callbackCalled = true;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          utils.respondToMessage(startTaskMessage, null, 'someResult');
          expect(callbackCalled).toBe(true);
        });

        it(`should invoke callback with error. context: ${context}`, async () => {
          await utils.initializeWithContext(context);

          let callbackCalled = false;
          const taskInfo: TaskInfo = {};
          tasks.startTask(taskInfo, (err, result) => {
            expect(err).toBe('someError');
            expect(result).toBeUndefined();
            callbackCalled = true;
          });

          const startTaskMessage = utils.findMessageByFunc('tasks.startTask');
          expect(startTaskMessage).not.toBeNull();
          utils.respondToMessage(startTaskMessage, 'someError');
          expect(callbackCalled).toBe(true);
        });
      } else {
        it(`should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo: TaskInfo = {};
          expect(() => tasks.startTask(taskInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('updateTask', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.meetingStage,
    ];
    it('should not allow calls before initialization', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => tasks.updateTask({} as any)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`should successfully pass taskInfo in context: ${JSON.stringify(context)}`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo = { width: 10, height: 10 };

          tasks.updateTask(taskInfo);
          const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
          expect(updateTaskMessage).not.toBeNull();
          expect(updateTaskMessage.args).toEqual([taskInfo]);
        });

        it(`should successfully pass the default info if height/width is missing: ${JSON.stringify(
          context,
        )}`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo = { width: 10 };

          tasks.updateTask(taskInfo);
          const taskInfoWithSize = tasks.getDefaultSizeIfNotProvided(taskInfo);
          const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
          expect(updateTaskMessage).not.toBeNull();
          expect(updateTaskMessage.args).toEqual([taskInfo]);
          expect(updateTaskMessage.args).toEqual([taskInfoWithSize]);
        });

        it(`should throw an error if extra properties are provided context: ${JSON.stringify(context)}`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo = { width: 10, height: 10, title: 'anything' };

          expect(() => tasks.updateTask(taskInfo)).toThrowError(
            'resize requires a TaskInfo argument containing only width and height',
          );
        });
      } else {
        it(`should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo: TaskInfo = {};
          expect(() => tasks.updateTask(taskInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('submitTask', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.task];
    it('should not allow calls before initialization', () => {
      expect(() => tasks.submitTask()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (!allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`should not allow calls from ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const taskInfo: TaskInfo = {};
          expect(() => tasks.submitTask(taskInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });

    it('should successfully pass result and appIds parameters when called from task context', async () => {
      await utils.initializeWithContext(FrameContexts.task);

      tasks.submitTask('someResult', ['someAppId', 'someOtherAppId']);

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should handle a single string passed as appIds parameter', async () => {
      await utils.initializeWithContext(FrameContexts.task);

      tasks.submitTask('someResult', 'someAppId');

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId']]);
    });
  });
});
