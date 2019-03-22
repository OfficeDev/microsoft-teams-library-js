import { Context, TabInstanceParameters, TabInformation } from ".";
import { getContext as getContextInternal, getTabInstances as getTabInstancesInternal, getMruTabInstances as getMruTabInstancesInternal } from "./publicAPIs";

/**
 * Retrieves the current context the frame is running in.
 * @param callback The callback to invoke when the {@link Context} object is retrieved.
 */
export function getContext(): Promise<Context> {
  return new Promise<Context>((resolve, reject) => {
    try {
      getContextInternal(context => {
        resolve(context);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export function getTabInstances(
  tabInstanceParameters?: TabInstanceParameters
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve, reject) => {
    try {
      getTabInstancesInternal(context => {
        resolve(context);
      }, tabInstanceParameters);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
export function getMruTabInstances(
  tabInstanceParameters?: TabInstanceParameters
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve, reject) => {
    try {
      getMruTabInstancesInternal(context => {
        resolve(context);
      }, tabInstanceParameters);
    } catch (error) {
      reject(error);
    }
  });
}