import * as microsoftTeams from '@microsoft/teams-js';
import { IncomingMessage } from 'http';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

export interface SSRProps {
  renderString: string;
  time: string;
  postBody?: string;
}

export default function IndexPage(props: SSRProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});
  const [clientTime, setClientTime] = useState('');

  useEffect(() => {
    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((ctx) => {
        setTeamsContext(ctx);
      });
      microsoftTeams.app.notifySuccess();
      setClientTime(JSON.stringify(new Date()));
    });
  }, []);

  return (
    <div>
      <Head>
        <title>SSR Test App</title>
      </Head>
      <div>
        <h1 id="id01">{props.renderString}</h1>
        <h1 id="stime">The server render time is {props.time.substring(12, 24)}</h1>
        <h1 id="ctime">The client render time is {clientTime.substring(12, 24)}</h1>
        {props.postBody && (
          <pre>
            <b>POST Body:</b> {JSON.stringify(JSON.parse(props.postBody), null, 2)}
          </pre>
        )}
        <pre>
          <b>Context:</b> {JSON.stringify(teamsContext, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * Parse request body manually from the HTTP stream
 * In getServerSideProps, the request body arrives as a stream of chunks,
 * unlike API Routes where Next.js automatically parses req.body
 */
async function parseBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve) => {
    let body = '';

    // Listen for incoming data chunks - this event fires multiple times
    // as the request body data arrives in pieces
    req.on('data', (chunk: Buffer) => {
      // Convert binary chunk to string and accumulate it
      body += chunk.toString();
    });

    // Listen for the end event - fires when all data has been received
    req.on('end', () => {
      resolve(body);
    });
  });
}

/**
 * @returns prop data
 */
export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const time = JSON.stringify(new Date());

  if (req.method === 'POST') {
    const postBody = await parseBody(req);
    return {
      props: {
        renderString: 'This string brought to you by the server (POST request)',
        postBody,
        time,
      },
    };
  }

  // Default GET handling
  return {
    props: {
      renderString: 'This string brought to you by the server (GET request)',
      time,
    },
  };
};
