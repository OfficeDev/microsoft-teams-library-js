import * as React from 'react';

export interface ApiPrettyPrintJsonContainerProps {
  title: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
  result?: string;
}

export const ApiPrettyPrintJsonContainer = (
  props: React.PropsWithChildren<ApiPrettyPrintJsonContainerProps>,
): React.ReactElement => {
  const { children, name, result } = props;
  const [newResult, setNewResult] = React.useState(result);

  if (!name || !/^[a-zA-Z0-9._]+$/.test(name)) {
    throw new Error('name has to be set and it can only contain alphanumeric characters, dots and underscores.');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseJSON = (json: any): unknown => {
    try {
      return JSON.parse(json);
    } catch (e) {
      return json;
    }
  };

  React.useEffect(() => {
    setNewResult(JSON.stringify(parseJSON(result), null, 2));
  }, [result]);

  return (
    <div
      className="boxAndButton"
      style={{
        display: 'inline-block',
        height: 200,
        width: 400,
        border: '5px solid turquoise',
      }}
      id={`box_${name}`}
    >
      {children}
      <div
        className="box"
        style={{
          border: '2px solid coral',
          height: 150,
          width: 400,
          overflow: 'auto',
        }}
      >
        <pre id={`text_${name}`}>{newResult}</pre>
      </div>
    </div>
  );
};
