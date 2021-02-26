import React, { ReactElement } from 'react';
import { tasks } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const TaskAPIs = (): ReactElement => {
  const [startTaskRes, setStartTaskRes] = React.useState('');
  const [updateTaskRes, setUpdateTaskRes] = React.useState('');
  const [submitTaskRes, setSubmitTaskRes] = React.useState('');

  const startTask = (taskInfo: any): void => {
    setStartTaskRes('tasks.startTask' + noHubSdkMsg);
    taskInfo = JSON.parse(taskInfo);
    const onComplete = (err: string, result: string): void => {
      setStartTaskRes('Error: ' + err + '\nResult: ' + result);
    };
    tasks.startTask(taskInfo, onComplete);
  };

  const updateTask = (taskInfo: any): void => {
    taskInfo = JSON.parse(taskInfo);
    setUpdateTaskRes('App SDK call updateTask was called');
    tasks.updateTask(taskInfo);
  };

  const submitTask = (result: any): void => {
    result = JSON.parse(result);
    setSubmitTaskRes('App SDK call submitTask was called');
    tasks.submitTask(result);
  };

  return (
    <>
      <BoxAndButton handleClick={startTask} output={startTaskRes} hasInput={true} title="Start Task" name="startTask" />
      <BoxAndButton
        handleClick={updateTask}
        output={updateTaskRes}
        hasInput={true}
        title="Update Task"
        name="updateTask"
      />
      <BoxAndButton
        handleClick={submitTask}
        output={submitTaskRes}
        hasInput={true}
        title="Submit Task"
        name="submitTask"
      />
    </>
  );
};

export default TaskAPIs;
