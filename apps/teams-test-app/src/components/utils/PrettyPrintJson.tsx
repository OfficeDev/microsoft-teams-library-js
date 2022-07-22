import React from 'react';

type PrettyPrintJsonProps = {
  result?: string;
};

export const PrettyPrintJson = ({ result }: PrettyPrintJsonProps): JSX.Element => {
  const [formattedResult, setFormattedResult] = React.useState(result);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseJSON = (data: any): unknown => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  };

  React.useEffect(() => {
    setFormattedResult(JSON.stringify(parseJSON(result), null, 2));
  }, [result]);

  return (
    <>
      <strong>Formatted Output: </strong>
      <div
        className="box"
        style={{
          overflow: 'auto',
        }}
      >
        <pre
          style={{
            border: '2px solid turquoise',
            whiteSpace: 'pre-wrap',
            margin: 0,
            height: '100%',
            textAlign: 'left',
            background: 'lightgrey',
          }}
        >
          {formattedResult}
        </pre>
      </div>
    </>
  );
};
