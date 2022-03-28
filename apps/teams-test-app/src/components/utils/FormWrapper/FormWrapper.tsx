import './FormWrapper.css';

export interface FormWrapperProps {
  className?: string;
  name: string; // system identifiable unique name in context of Teams Client and should contain no spaces
}

export const FormWrapper = (props: React.PropsWithChildren<FormWrapperProps>): React.ReactElement => {
  const { className, children, name } = props;

  if (!name || !/^[a-zA-Z0-9._]+$/.test(name)) {
    throw new Error('name has to be set and it can only contain alphanumeric characters, dots and underscores.');
  }

  return (
    <div className={`formWrapper ${className}`} id={`box_${name}`}>
      {children}
    </div>
  );
};
