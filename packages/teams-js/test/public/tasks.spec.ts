import { TaskInfo } from '../../src/public/interfaces';
import { TaskModuleDimension } from '../../src/public/constants';
import { tasks } from '../../src/public/tasks';
import { Utils } from '../utils';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';

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
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('startTask', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];

    it('should not allow calls before initialization', () => {
      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContexts => allowedContexts === context)) {
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

    it('should pass along entire TaskInfo parameter in sidePanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);

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

    it('should pass along entire TaskInfo parameter in content', async () => {
      await utils.initializeWithContext(FrameContexts.content);

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

    it('should invoke callback with result', async () => {
      await utils.initializeWithContext(FrameContexts.content);

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

    it('should invoke callback with error', async () => {
      await utils.initializeWithContext(FrameContexts.content);

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
  });

  describe('updateTask', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.meetingStage,
    ];
    it('should not allow calls before initialization', () => {
      // tslint:disable-next-line:no-any
      expect(() => tasks.updateTask({} as any)).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContexts => allowedContexts === context)) {
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

    it('should successfully pass taskInfo in sidePanel context', async () => {
      await utils.initializeWithContext(FrameContexts.sidePanel);
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(updateTaskMessage).not.toBeNull();
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it('should successfully pass taskInfo in task context', async () => {
      await utils.initializeWithContext(FrameContexts.task);
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(updateTaskMessage).not.toBeNull();
      console.log([taskInfo]);
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it('should throw an error if extra properties are provided', async () => {
      await utils.initializeWithContext(FrameContexts.task);
      const taskInfo = { width: 10, height: 10, title: 'anything' };

      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'resize requires a TaskInfo argument containing only width and height',
      );
    });
  });

  describe('submitTask', () => {
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.meetingStage,
    ];
    it('should not allow calls before initialization', () => {
      expect(() => tasks.submitTask()).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(context => {
      if (!allowedContexts.some(allowedContexts => allowedContexts === context)) {
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

    it('should successfully pass result and appIds parameters when called from sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      tasks.submitTask('someResult', ['someAppId', 'someOtherAppId']);

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
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
