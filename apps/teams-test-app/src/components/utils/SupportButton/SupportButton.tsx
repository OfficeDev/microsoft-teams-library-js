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
  const label = `Is ${module} supported?: ${
    isSupported ? (
      <>
        <Check fill="green" /> yes
      </>
    ) : (
      <>
        <X fill="red" /> no
      </>
    )
  }`;
  return (
    <BlockContainer name={name}>
      <div className="wrapper">{label}</div>
    </BlockContainer>
  );
};
