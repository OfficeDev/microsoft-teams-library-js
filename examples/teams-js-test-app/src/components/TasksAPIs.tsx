import React from 'react';
import { tasks } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const TaskAPIs = () => {
  const [startTask, setStartTask] = React.useState("");
  const [updateTask, setUpdateTask] = React.useState("");
  const [submitTask, setSubmitTask] = React.useState("");

  const returnStartTask = (taskInfo: any) => {
    setStartTask("tasks.startTask" + noHubSdkMsg);
    taskInfo = JSON.parse(taskInfo);
    const onComplete = (err: string, result: string) => {
      setStartTask("Error: " + err + "\nResult: " + result);
    };
    tasks.startTask(taskInfo, onComplete);
  };

  const returnUpdateTask = (taskInfo: any) => {
    taskInfo = JSON.parse(taskInfo);
    setUpdateTask("App SDK call updateTask was called");
    tasks.updateTask(taskInfo);
  }

  const returnSubmitTask = (result: any) => {
    result = JSON.parse(result);
    setSubmitTask("App SDK call submitTask was called");
    tasks.submitTask(result);
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnStartTask}
        output={startTask}
        hasInput={true}
        title="Start Task"
        name="startTask"
      />
      <BoxAndButton
        handleClick={returnUpdateTask}
        output={updateTask}
        hasInput={true}
        title="Update Task"
        name="updateTask"
      />
      <BoxAndButton
        handleClick={returnSubmitTask}
        output={submitTask}
        hasInput={true}
        title="Submit Task"
        name="submitTask"
      />
    </>
  );
};

export default TaskAPIs;
