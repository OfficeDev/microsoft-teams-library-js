import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

import { ContextDisplay, PageInfo, PostBodyDisplay } from './components/CommonComponents';
import { parseBody } from './utils/serverUtils';

export interface FailureSuccessTestPageProps {
  renderString: string;
  time: string;
  postCount?: number;
  postBody?: string;
  withMessage?: boolean;
}

// Test Instructions:
// - First POST request will trigger notifyFailure
// - Second POST request will trigger notifySuccess
// - Use a tool like Postman or curl to send POST requests to this page
// - Add ?withMessage=true to the URL to include a message in notifyFailure
//
// Example curl commands:
// Without message:
// curl -X POST https://localhost:53000/failureSuccessTest \
//   -H "Content-Type: application/x-www-form-urlencoded" \
//   -d "test=value"
//
// With message:
// curl -X POST https://localhost:53000/failureSuccessTest?withMessage=true \
//   -H "Content-Type: application/x-www-form-urlencoded" \
//   -d "test=value"

// Track the number of POST requests received
let postRequestCount = 0;

export default function FailureSuccessTestPage(props: FailureSuccessTestPageProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});
  const [clientTime, setClientTime] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');

  useEffect(() => {
    console.log(`!!!postCount in useEffect: ${props.postCount}`);

    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((ctx) => {
        setTeamsContext(ctx);
      });

      // Call notifyFailure on first POST request
      if (props.postCount === 0) {
        console.log('!!!Calling notifyFailure for first POST request');
        const message = props.withMessage
          ? 'Bearer realm="", authorization_uri="https://some_url/authorize", error="insufficient_claims", claims="Base65Encoded_claims_value"'
          : '';
        const request = {
          reason: microsoftTeams.app.FailedReason.Unauthorized,
          message: message,
        };
        console.log(`!!!notifyFailure request: ${JSON.stringify(request)}`);
        microsoftTeams.app.notifyFailure(request);
        setNotificationStatus(`notifyFailure called${props.withMessage ? ' with message' : ''} (first POST request)`);
      }
      // Call notifySuccess on second POST request
      else {
        console.log('!!!Calling notifySuccess for second POST request');
        microsoftTeams.app.notifySuccess();
        setNotificationStatus('notifySuccess called (second POST request)');
      }
      setClientTime(JSON.stringify(new Date()));
    });
  }, [props.postCount, props.withMessage]);

  return (
    <div>
      <Head>
        <title>Test Page</title>
      </Head>
      <div>
        <PageInfo renderString={props.renderString} serverTime={props.time} clientTime={clientTime} />
        <h2 id="post-count">POST Request Count: {props.postCount}</h2>
        {notificationStatus && (
          <h2 id="notification-status" style={{ color: props.postCount === 0 ? 'red' : 'green' }}>
            Status: {notificationStatus}
          </h2>
        )}
        <PostBodyDisplay postBody={props.postBody} />
        <ContextDisplay context={teamsContext} />
      </div>
    </div>
  );
}

/**
 * @returns prop data
 */
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
  const time = JSON.stringify(new Date());
  const withMessage = query.withMessage === 'true';

  if (req.method === 'POST') {
    const currentCount = postRequestCount;
    postRequestCount++;
    const postBody = await parseBody(req);
    console.log('!!!!POST request received');
    console.log(`!!!!POST request #${currentCount} postRequestCount: ${postRequestCount}`);

    // Add delay for POST requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('!!!!POST request delay complete', postRequestCount);
    // Reset counter after the second request
    if (postRequestCount >= 2) {
      postRequestCount = 0;
    }

    return {
      props: {
        renderString: `POST request #${currentCount} received`,
        postBody,
        time,
        postCount: currentCount,
        withMessage,
      },
    };
  }

  console.log('!!!!GET request received');
  // Default GET handling
  return {
    props: {
      renderString: 'Waiting for POST requests... (GET request)',
      time,
    },
  };
};
