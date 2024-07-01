import React, { ReactElement } from 'react';

import AppAPIs from '../components/AppAPIs';

export const SecondRoute = (): ReactElement => (
  <div>
    This is an additional route for testing purposes.
    <AppAPIs />
  </div>
);
