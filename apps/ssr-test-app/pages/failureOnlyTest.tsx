import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

import { ContextDisplay, PageInfo, PostBodyDisplay } from '../components/CommonComponents';
import { parseBody } from '../utils/serverUtils';

export interface FailureOnlyTestPageProps {
  renderString: string;
  time: string;
  isPostRequest?: boolean;
  postBody?: string;
  withMessage?: boolean;
}

//Every POST request will trigger notifyFailure
export default function FailureOnlyTestPage(props: FailureOnlyTestPageProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});
  const [clientTime, setClientTime] = useState('');

  useEffect(() => {
    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((ctx) => {
        setTeamsContext(ctx);
      });

      // Always call notifyFailure on every POST request
      if (props.isPostRequest) {
        const message = props.withMessage
          ? 'Bearer realm="", authorization_uri="https://some_url/authorize", error="insufficient_claims", claims="Base64Encoded_claims_value"'
          : '';
        const request = {
          reason: microsoftTeams.app.FailedReason.Unauthorized,
          authHeader: message,
        };
        microsoftTeams.app.notifyFailure(request);
      }
      setClientTime(JSON.stringify(new Date()));
    });
  }, [props.isPostRequest, props.withMessage]);

  return (
    <div>
      <Head>
        <title>Failure Only Test Page</title>
      </Head>
      <div>
        <PageInfo renderString={props.renderString} serverTime={props.time} clientTime={clientTime} />
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

    return {
      props: {
        renderString: 'POST request received',
        postBody,
        time,
        isPostRequest: true,
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
