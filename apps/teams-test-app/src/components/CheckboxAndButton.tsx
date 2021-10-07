import * as React from 'react';

interface CheckboxAndButtonProps {
  handleClick?: () => void;
  handleClickWithInput?: (input: string) => void;
  hasInput: boolean;
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  output: string;
  hasTitle: boolean;
  checkBoxTitle?: string;
}

// Exactly one of handleClick or handleClickWithInput should be passed in.
const CheckboxAndButton = ({
  handleClick,
  handleClickWithInput,
  hasInput,
  output,
  title,
  name,
  hasTitle,
  checkBoxTitle,
}: CheckboxAndButtonProps): React.ReactElement => {
  let input = '';
  let checkboxState = false;
  if (!handleClick === !handleClickWithInput) {
    throw new Error('Please implement exactly one of either handleClick or handleClickWithInput for ' + title + '. ');
  }
  const setCheckboxState = (val: boolean): void => {
    checkboxState = val;
  };
  const setInput = (val: string): void => {
    input = val;
  };
  const getOutput = (): void => {
    if (handleClick) {
      handleClick();
    } else if (handleClickWithInput) {
      handleClickWithInput(checkboxState.toString());
    }
  };
  return (
    <div
      className="boxAndButton"
      style={{
        height: 200,
        width: 400,
        border: '5px solid black',
        textAlign: 'center',
      }}
      id={`box_${name}`}
    >
      <input name={`button_${name}`} type="button" value={title} onClick={getOutput} />
      {hasInput && <input type="text" onChange={e => setInput(e.target.value)} />}
      {hasTitle && <input style={{ border: '0px' }} type="text" name={checkBoxTitle} value={checkBoxTitle} />}
      {hasTitle && <input type="checkbox" name={checkBoxTitle} onChange={e => setCheckboxState(e.target.checked)} />}
      <div
        className="box"
        style={{
          border: '2px solid red',
          height: 150,
          width: 400,
          overflow: 'auto',
        }}
      >
        <span id={`text_${name}`} style={{ wordWrap: 'break-word' }}>
          {output}
        </span>
      </div>
    </div>
  );
};

export default CheckboxAndButton;
