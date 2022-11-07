import * as microsoftTeams from '@microsoft/teams-js';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';

export interface SSRProps {
  renderString: string;
  context: microsoftTeams.app.Context;
}

export default function IndexPage(props: SSRProps): ReactElement {
  const [teamsContext, setTeamsContext] = useState({});

  useEffect(() => {
    microsoftTeams.app.initialize().then(() =>
      microsoftTeams.app.getContext().then((ctx) => {
        if (ctx) {
          setTeamsContext(ctx);
        }
      }),
    );
  }, []);

  // useEffect(() => {
  //   document.getElementById('id01').innerHTML = "CSR'd";
  // }, []);

  return (
    <div>
      <Head>
        <title>SSR Test App</title>
      </Head>
      <div> Hello World. </div>
      <div>
        <h1 id="id01">{props.renderString}</h1>
        <pre>SSR Context: {JSON.stringify(props.context, null, 2)}</pre>
        <pre>CSR Context: {JSON.stringify(teamsContext, null, 2)}</pre>
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
  let appContext: microsoftTeams.app.Context = {};

  microsoftTeams.app
    .initialize()
    .then(() => microsoftTeams.app.getContext())
    .then((ctx) => {
      if (ctx) {
        appContext = ctx;
      }
    });

  return {
    props: {
      renderString: "SSR'd",
      context: appContext,
    },
  };
};
