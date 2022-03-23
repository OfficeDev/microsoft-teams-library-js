import './SupportButton.css';

import { ReactElement } from 'react';

import { Check } from '../../Icons/Check/Check';
import { X } from '../../Icons/X/X';
import { BlockContainer } from '../BlockContainer/BlockContainer';

export type GlowButtonProps = {
  module: string;
  name: string;
  isSupported: boolean;
};

export const SupportButton = (props: GlowButtonProps): ReactElement => {
  const { module, name, isSupported } = props;
  const label = `Is ${module} supported?:`;
  const supportIcon = isSupported ? (
    <div className="stateWrapper">
      <Check fill="green" /> yes
    </div>
  ) : (
    <div className="stateWrapper">
      <X fill="red" /> no
    </div>
  );

  return (
    <BlockContainer name={name}>
      <div className="labelIconWrapper">
        {label} {supportIcon}
      </div>
    </BlockContainer>
  );
};
