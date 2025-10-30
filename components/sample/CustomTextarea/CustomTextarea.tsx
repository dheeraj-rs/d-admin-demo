import { FC, TextareaHTMLAttributes } from 'react';
import './CustomTextarea.scss';

interface CustomTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const CustomTextarea: FC<CustomTextareaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="custom-textarea">
      {label && <label className="custom-textarea__label">{label}</label>}
      <textarea className={`custom-textarea__field ${className}`} {...props} />
      {error && <span className="custom-textarea__error">{error}</span>}
    </div>
  );
}; 