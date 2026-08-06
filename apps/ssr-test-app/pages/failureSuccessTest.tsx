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

// Track POST requests per app session rather than per server process.
//
// A single module-level counter is shared by every request this page ever
// serves, and four tab definitions point at this same page (plain, customInit,
// withMessage, and both), so tests observe each other's state. Because the count
// resets on every second request, the behaviour is parity-dependent: an even
// count yields notifyFailure, an odd one yields notifySuccess. Any extra POST --
// a Cypress retry, a host-initiated reload, a refresh -- flips that parity, and
// the next test then sees notifySuccess where it asserts notifyFailure. It
// passes again on the following attempt, which is what makes it look flaky
// rather than broken.
//
// The app session id is the correct scope. The host regenerates it when the app,
// entity or frame context changes, so a page load or tab switch starts a fresh
// count, while the notifyFailure -> reload -> notifySuccess cycle keeps the same
// one, which is the sequence this counter exists to track.
const postRequestCountBySession = new Map<string, number>();

// This server outlives many test runs, so the map is bounded. Entries are only a
// small integer each, and the oldest session is always the least interesting.
const maxTrackedSessions = 100;

// Used when the session id cannot be read. Falls back to the previous shared
// behaviour rather than failing the request, so a body shape change degrades to
// today's semantics instead of breaking the page.
const fallbackSessionKey = 'unknown-session';

function getSessionKey(postBody: string): string {
  try {
    const parsedBody = JSON.parse(postBody);
    const sessionId = parsedBody?.hostContext?.appSessionId;
    return typeof sessionId === 'string' && sessionId.length > 0 ? sessionId : fallbackSessionKey;
  } catch {
    return fallbackSessionKey;
  }
}

function nextPostCountForSession(sessionKey: string): number {
  const currentCount = postRequestCountBySession.get(sessionKey) ?? 0;
  postRequestCountBySession.set(sessionKey, currentCount + 1);

  if (postRequestCountBySession.size > maxTrackedSessions) {
    // Map preserves insertion order, so the first key is the oldest session.
    const oldestSessionKey = postRequestCountBySession.keys().next().value;
    if (oldestSessionKey !== undefined && oldestSessionKey !== sessionKey) {
      postRequestCountBySession.delete(oldestSessionKey);
    }
  }

  return currentCount;
}

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
          reason: microsoftTeams.app.FailedReason.AuthFailed,
          authHeader: message,
        };
        microsoftTeams.app.notifyFailure(request);
        setNotificationStatus(`notifyFailure called${props.withMessage ? ' with message' : ''} (first POST request)`);
      }
      // Call notifySuccess on second POST request
      else {
        microsoftTeams.app.notifySuccess();
        setNotificationStatus('notifySuccess called');
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
    const postBody = await parseBody(req);
    // Read the body first: the session key comes out of it, and the count has to
    // be scoped to that session rather than to this server process.
    const currentCount = nextPostCountForSession(getSessionKey(postBody));

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
