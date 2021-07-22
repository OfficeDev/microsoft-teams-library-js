import * as React from 'react';

interface BoxAndButtonProps {
  handleClick?: () => void;
  handleClickWithInput?: (input: string) => void;
  defaultInput?: string;
  hasInput: boolean;
  title: string;
  name: string; // system identifiable unique name in context of MOS App and should contain no spaces or dots
  output: string;
}

//  TODO: consider looking into a grayed out example of parameters show in the box.
const BoxAndButton = ({
  handleClick,
  handleClickWithInput,
  defaultInput,
  hasInput,
  output,
  title,
  name,
}: BoxAndButtonProps): React.ReactElement => {
  const ref = React.useRef<HTMLInputElement>(null);

  if (!handleClick === !handleClickWithInput) {
    throw new Error('Please implement exactly one of either handleClick or handleClickWithInput for ' + title + '. ');
  }
  const getOutput = (): void => {
    if (handleClick) {
      handleClick();
    } else if (handleClickWithInput) {
      if (ref != null && ref.current != null) {
        handleClickWithInput(ref.current.value);
      }
    }
  };

  return (
    <div
      className="boxAndButton"
      style={{
        display: 'inline-block',
        height: 200,
        width: 400,
        border: '5px solid black',
        textAlign: 'center',
      }}
      id={`box_${name}`}
    >
      {hasInput && <input type="text" name={`input_${name}`} defaultValue={defaultInput} ref={ref} />}
      <input name={`button_${name}`} type="button" value={title} onClick={getOutput} />
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

export default BoxAndButton;
