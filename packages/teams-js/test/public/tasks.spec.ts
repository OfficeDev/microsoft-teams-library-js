import { TaskInfo } from '../../src/public/interfaces';
import { TaskModuleDimension } from '../../src/public/constants';
import { tasks } from '../../src/public/tasks';
import { Utils } from '../utils';
import { app } from '../../src/public/app';

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
    it('should not allow calls before initialization', () => {
      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "remove".',
      );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "task".',
      );
    });

    it('should pass along entire TaskInfo parameter in sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

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
      await utils.initializeWithContext('content');

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
      await utils.initializeWithContext('content');

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
      await utils.initializeWithContext('content');

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
    it('should not allow calls before initialization', () => {
      // tslint:disable-next-line:no-any
      expect(() => tasks.updateTask({} as any)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from content context', async () => {
      await utils.initializeWithContext('content');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "content".',
      );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "sidePanel".',
      );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "meetingStage".',
      );
    });

    it('should successfully pass taskInfo in task context', async () => {
      await utils.initializeWithContext('task');
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(updateTaskMessage).not.toBeNull();
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it('should throw an error if extra properties are provided', async () => {
      await utils.initializeWithContext('task');
      const taskInfo = { width: 10, height: 10, title: 'anything' };

      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'resize requires a dialogInfo argument containing only width and height',
      );
    });
  });

  describe('submitTask', () => {
    it('should not allow calls before initialization', () => {
      expect(() => tasks.submitTask()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "settings".',
      );
    });

    it('should not allow calls from content context', async () => {
      await utils.initializeWithContext('content');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "content".',
      );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "sidePanel".',
      );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "meetingStage".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      expect(() => tasks.submitTask()).toThrowError(
        'This call is only allowed in following contexts: ["task"]. Current context: "remove".',
      );
    });

    it('should successfully pass result and appIds parameters when called from task context', async () => {
      await utils.initializeWithContext('task');

      tasks.submitTask('someResult', ['someAppId', 'someOtherAppId']);

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should handle a single string passed as appIds parameter', async () => {
      await utils.initializeWithContext('task');

      tasks.submitTask('someResult', 'someAppId');

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId']]);
    });
  });
});
