import * as React from "react";
// TODO: Will come back and generate this UI to be a UI componment
interface CheckboxAndButtonProps {
  handleClick: (input?: any) => void;
  hasInput: boolean;
  title: string;
  name: string; // system identifiable unique name in context of MOS App and should contain no spaces
  output: string;
  hasTitle: boolean;
  checkBoxTitle?: string;
}

const CheckboxAndButton = ({
  handleClick,
  hasInput,
  output,
  title,
  name,
  hasTitle,
  checkBoxTitle
}: CheckboxAndButtonProps) => {
  let input = "";
  let checkboxState = false;
  const setCheckboxState = (val: boolean) => {
    checkboxState = val;
  };
  const setInput = (val: string) => {
    input = val;
  };
  const getOutput = () => {
    hasInput ? handleClick(input) : (hasTitle? handleClick(checkboxState) : handleClick());
  };
  return (
    <div
      className="boxAndButton"
      style={{
        height: 200,
        width: 400,
        border: "5px solid black",
        textAlign: "center",
      }}
      id={`box_${name}`}
    >
      <input name={`button_${name}`} type="button" value={title} onClick={getOutput} />
      {hasInput && (
        <input type="text" onChange={(e) => setInput(e.target.value)} />
      )}
      {hasTitle && (
        <input  style={{ border: "0px"}} type="text" name={checkBoxTitle} value={checkBoxTitle} />
      )}
      {hasTitle && (
        <input type="checkbox" name={checkBoxTitle} onChange={(e) => setCheckboxState(e.target.checked)}/>
      )}
      <div
        className="box"
        style={{
          border: "2px solid red",
          height: 150,
          width: 400,
          overflow: "auto",
        }}
      >
        <span id={`text_${name}`} style={{ wordWrap: "break-word" }}>{output}</span>
      </div>
    </div>
  );
};

export default CheckboxAndButton;
