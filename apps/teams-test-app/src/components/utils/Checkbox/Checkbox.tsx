export type CheckboxProps = {
  label: string;
  onChange: () => void;
  checked: boolean;
};

export const Checkbox = (props: CheckboxProps): JSX.Element => {
  const { checked, label, onChange } = props;
  return (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
};
