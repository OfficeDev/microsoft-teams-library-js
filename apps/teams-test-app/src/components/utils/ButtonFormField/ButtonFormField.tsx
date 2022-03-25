import { Button } from '../Button.tsx/Button';

export type ButtonFormFieldProps = {
  onClick: (e) => void;
  label: string;
  buttonLabel?: string;
  name: string;
};

export const ButtonFormField = (props: ButtonFormFieldProps): JSX.Element => {
  const { onClick, label, name, buttonLabel } = props;
  return (
    <div id={`box_${name}`}>
      <h3>{label}</h3>
      <Button onClick={onClick} label={buttonLabel || label} />
    </div>
  );
};
