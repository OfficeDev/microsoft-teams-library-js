import * as React from 'react';

interface BoxAndButtonProps {
  handleClick?: () => void;
  handleClickWithInput?: (input: string) => void;
  hasInput: boolean;
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces or dots
  output: string;
}

//  TODO: consider looking into a grayed out example of parameters show in the box.
const BoxAndButton = ({
  handleClick,
  handleClickWithInput,
  hasInput,
  output,
  title,
  name,
}: BoxAndButtonProps): React.ReactElement => {
  const [input, setInput] = React.useState('');

  if (!handleClick === !handleClickWithInput) {
    throw new Error('Please implement exactly one of either handleClick or handleClickWithInput for ' + title + '. ');
  }
  const getOutput = (): void => {
    if (handleClick) {
      handleClick();
    } else if (handleClickWithInput) {
      handleClickWithInput(input);
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
      {hasInput && <input type="text" onChange={(e) => setInput(e.target.value)} />}
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
