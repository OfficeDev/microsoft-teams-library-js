import React, { ReactElement } from 'react';
import { TaskInfo, tasks } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const TaskAPIs = (): ReactElement => {
  const [startTaskRes, setStartTaskRes] = React.useState('');
  const [updateTaskRes, setUpdateTaskRes] = React.useState('');
  const [submitTaskRes, setSubmitTaskRes] = React.useState('');

  const startTask = (taskInfoInput: string): void => {
    setStartTaskRes('tasks.startTask' + noHubSdkMsg);
    let taskInfo: TaskInfo = JSON.parse(taskInfoInput);
    const onComplete = (err: string, result: string): void => {
      setStartTaskRes('Error: ' + err + '\nResult: ' + result);
    };
    tasks.startTask(taskInfo, onComplete);
  };

  const updateTask = (taskInfoInput: string): void => {
    setUpdateTaskRes('App SDK call updateTask was called');
    let taskInfo: TaskInfo = JSON.parse(taskInfoInput);
    tasks.updateTask(taskInfo);
  };

  const submitTask = (result: string): void => {
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
