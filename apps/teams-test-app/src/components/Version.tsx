import { version } from '@microsoft/teams-js';
import React from 'react';

const Version = (): React.ReactElement => (
  <div>
    Current library version: <span id="version">{version ?? 'unavailable'}</span>
  </div>
);

export default Version;
