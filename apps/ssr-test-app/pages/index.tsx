import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

import { ContextDisplay, PageInfo, PostBodyDisplay } from './components/CommonComponents';
import { parseBody } from './utils/serverUtils';

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
