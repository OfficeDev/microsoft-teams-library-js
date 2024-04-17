import React, { ReactElement } from 'react';
import AppAPIs from './AppAPIs';

const EmptyPage = (): ReactElement => (
  <div>
    This is an empty page.
    <AppAPIs />
  </div>
);

export default EmptyPage;
