import React from 'react';

interface PageInfoProps {
  renderString: string;
  serverTime: string;
  clientTime: string;
}

export function PageInfo({ renderString, serverTime, clientTime }: PageInfoProps): React.ReactElement {
  return (
    <>
      <h1 id="id01">{renderString}</h1>
      <h1 id="stime">The server render time is {serverTime.substring(12, 24)}</h1>
      <h1 id="ctime">The client render time is {clientTime.substring(12, 24)}</h1>
    </>
  );
}

interface PostBodyDisplayProps {
  postBody?: string;
}

export function PostBodyDisplay({ postBody }: PostBodyDisplayProps): React.ReactElement | null {
  if (!postBody) {
    return null;
  }

  return (
    <pre>
      <b>POST Body:</b> {postBody}
    </pre>
  );
}

interface ContextDisplayProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: any;
}

export function ContextDisplay({ context }: ContextDisplayProps): React.ReactElement {
  return (
    <pre>
      <b>Context:</b> {JSON.stringify(context, null, 2)}
    </pre>
  );
}
