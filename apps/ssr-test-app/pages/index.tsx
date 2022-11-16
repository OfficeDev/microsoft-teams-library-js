import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

export interface SSRProps {
  renderString: string;
}

export default function IndexPage(props: SSRProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});

  useEffect(() => {
    microsoftTeams.app.initialize().then(() => {
      microsoftTeams.app.getContext().then((ctx) => {
        setTeamsContext(ctx);
      });
      microsoftTeams.app.notifySuccess();
    });
  }, []);

  return (
    <div>
      <Head>
        <title>SSR Test App</title>
      </Head>
      <div>
        <h1 id="id01">{props.renderString}</h1>
        <pre>Context: {JSON.stringify(teamsContext, null, 2)}</pre>
      </div>
    </div>
  );
}

/**
 *
 * @param context
 * @returns prop data
 */
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      renderString: "SSR'd",
    },
  };
};
