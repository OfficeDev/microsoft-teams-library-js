import { TaskInfo } from '../../src/public/interfaces';
import { TaskModuleDimension } from '../../src/public/constants';
import { tasks } from '../../src/public/tasks';
import { Utils } from '../utils';
import { _uninitialize } from '../../src/public/publicAPIs';

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
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('startTask', () => {
    it('should not allow calls before initialization', () => {
      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from task context', () => {
      utils.initializeWithContext('task');

      const taskInfo: TaskInfo = {};
      expect(() => tasks.startTask(taskInfo)).toThrowError("This call is not allowed in the 'task' context");
    });

    it('should pass along entire TaskInfo parameter in sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

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

    it('should pass along entire TaskInfo parameter in content', () => {
      utils.initializeWithContext('content');

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

    it('should invoke callback with result', () => {
      utils.initializeWithContext('content');

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

    it('should invoke callback with error', () => {
      utils.initializeWithContext('content');

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

    it('should successfully pass taskInfo in sidePanel context', () => {
      utils.initializeWithContext('sidePanel');
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(updateTaskMessage).not.toBeNull();
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it('should successfully pass taskInfo in task context', () => {
      utils.initializeWithContext('task');
      const taskInfo = { width: 10, height: 10 };

      tasks.updateTask(taskInfo);

      const updateTaskMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(updateTaskMessage).not.toBeNull();
      expect(updateTaskMessage.args).toEqual([taskInfo]);
    });

    it('should throw an error if extra properties are provided', () => {
      utils.initializeWithContext('task');
      const taskInfo = { width: 10, height: 10, title: 'anything' };

      expect(() => tasks.updateTask(taskInfo)).toThrowError(
        'updateTask requires a taskInfo argument containing only width and height',
      );
    });
  });

  describe('submitTask', () => {
    it('should not allow calls before initialization', () => {
      expect(() => tasks.submitTask()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => tasks.submitTask()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => tasks.submitTask()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => tasks.submitTask()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should successfully pass result and appIds parameters when called from sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      tasks.submitTask('someResult', ['someAppId', 'someOtherAppId']);

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should successfully pass result and appIds parameters when called from task context', () => {
      utils.initializeWithContext('task');

      tasks.submitTask('someResult', ['someAppId', 'someOtherAppId']);

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should handle a single string passed as appIds parameter', () => {
      utils.initializeWithContext('task');

      tasks.submitTask('someResult', 'someAppId');

      const submitTaskMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitTaskMessage).not.toBeNull();
      expect(submitTaskMessage.args).toEqual(['someResult', ['someAppId']]);
    });
  });
});
