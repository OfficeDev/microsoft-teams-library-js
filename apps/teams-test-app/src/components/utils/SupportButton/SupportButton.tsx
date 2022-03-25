import './SupportButton.css';

import { ReactElement } from 'react';

import { Check } from '../../Icons/Check/Check';
import { X } from '../../Icons/X/X';

export type GlowButtonProps = {
  module: string;
  name: string;
  isSupported: boolean;
};

export const SupportButton = (props: GlowButtonProps): ReactElement => {
  const { module, isSupported } = props;
  const label = `Is ${module} supported?:`;
  const supportIcon = isSupported ? (
    <div className="stateWrapper">
      <Check fill="green" />
    </div>
  ) : (
    <div className="stateWrapper">
      <X fill="red" />
    </div>
  );

  return (
    <div className="labelIconWrapper">
      {label} {supportIcon}
    </div>
  );
};
