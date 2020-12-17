import * as React from "react";

interface BoxAndButtonProps {
  handleClick: (input?: any) => void;
  hasInput: boolean;
  title: string;
  output: string;
}

const BoxAndButton = ({
  handleClick,
  hasInput,
  output,
  title,
}: BoxAndButtonProps) => {
  let input = "";
  const setInput = (val: string) => {
    input = val;
  };
  const getOutput = () => {
    hasInput ? handleClick(input) : handleClick();
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
    >
      <input type="button" value={title} onClick={getOutput} />
      {hasInput && (
        <input type="text" onChange={(e) => setInput(e.target.value)} />
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
        <span style={{ wordWrap: "break-word" }}>{output}</span>
      </div>
    </div>
  );
};

export default BoxAndButton;
