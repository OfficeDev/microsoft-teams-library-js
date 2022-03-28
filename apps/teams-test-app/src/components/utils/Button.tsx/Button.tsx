import './Button.css';
export type ButtonProps = {
  onClick?: (e) => void;
  label: string;
  className?: string;
  type?: 'button' | 'submit';
};

export const Button = (props: ButtonProps): JSX.Element => {
  const { className, label, onClick, type = 'button' } = props;

  return (
    <button type={type} className={`button ${className}`} onClick={onClick}>
      {label}
    </button>
  );
};
