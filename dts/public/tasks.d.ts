import { TaskInfo } from "./interfaces";
import { IAppWindow } from "./appWindow";
/**
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
export declare namespace tasks {
    /**
     * Allows an app to open the task module.
     * @param taskInfo An object containing the parameters of the task module
     * @param submitHandler Handler to call when the task module is completed
     */
    function startTask(taskInfo: TaskInfo, submitHandler?: (err: string, result: string) => void): IAppWindow;
    /**
     * Update height/width task info properties.
     * @param taskInfo An object containing width and height properties
     */
    function updateTask(taskInfo: TaskInfo): void;
    /**
     * Submit the task module.
     * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submitTask(result?: string | object, appIds?: string | string[]): void;
}
