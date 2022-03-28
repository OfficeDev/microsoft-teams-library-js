import './PrettyPrintJSON.css';

export type PrettyPrintJSONProps<T> = {
  data: T;
  label: string;
  name: string;
};

export const PrettyPrintJSON = <T,>(props: PrettyPrintJSONProps<T>): JSX.Element => {
  const { data, label, name } = props;

  return (
    <div id={`text_${name}`} className="prettyPrintWrapper">
      <div className="header">{label}</div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
