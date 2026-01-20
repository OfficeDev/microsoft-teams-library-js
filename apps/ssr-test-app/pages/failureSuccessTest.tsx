import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

import { ContextDisplay, PageInfo, PostBodyDisplay } from '../components/CommonComponents';
import { parseBody } from '../utils/serverUtils';

export interface FailureSuccessTestPageProps {
  renderString: string;
  time: string;
  postCount: number;
  postBody?: string;
  withMessage?: boolean;
}

// First POST request will trigger notifyFailure
// Add ?withMessage=true to the URL to include a message in notifyFailure
// Second POST request will trigger notifySuccess

// Track the number of POST requests received
let postRequestCount = 0;

export default function FailureSuccessTestPage(props: FailureSuccessTestPageProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});
  const [clientTime, setClientTime] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('');

  useEffect(() => {
    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((ctx) => {
        setTeamsContext(ctx);
      });

      // Call notifyFailure on first POST request
      if (props.postCount === 0) {
        const message = props.withMessage
          ? 'Bearer realm="", authorization_uri="https://some_url/authorize", error="insufficient_claims", claims="Base64Encoded_claims_value"'
          : '';
        const request = {
          reason: microsoftTeams.app.FailedReason.Unauthorized,
          authHeader: message,
        };
        microsoftTeams.app.notifyFailure(request);
        setNotificationStatus(`notifyFailure called${props.withMessage ? ' with message' : ''} (first POST request)`);
      }
      // Call notifySuccess on second POST request
      else {
        microsoftTeams.app.notifySuccess();
        setNotificationStatus('notifySuccess called (second POST request)');
      }
      setClientTime(JSON.stringify(new Date()));
    });
  }, [props.postCount, props.withMessage]);

  return (
    <div>
      <Head>
        <title>Failure & Success Test Page</title>
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
export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const time = JSON.stringify(new Date());
  const withMessage = query.withMessage === 'true';

  if (req.method === 'POST') {
    const currentCount = postRequestCount;
    postRequestCount++;
    const postBody = await parseBody(req);

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

  // Reject non-POST requests with 405 Method Not Allowed
  res.setHeader('Allow', ['POST']);
  res.statusCode = 405;
  res.end('Method Not Allowed');

  return {
    props: {},
  };
};
