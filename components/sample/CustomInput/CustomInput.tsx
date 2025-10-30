import { FC, InputHTMLAttributes } from 'react';
import './CustomInput.scss';

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const CustomInput: FC<CustomInputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="custom-input">
      {label && <label className="custom-input__label">{label}</label>}
      <input className={`custom-input__field ${className}`} {...props} />
      {error && <span className="custom-input__error">{error}</span>}
    </div>
  );
}; 