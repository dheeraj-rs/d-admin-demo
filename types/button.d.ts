declare module 'button' {
  export interface ButtonProps {
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
  }

  export const Button: React.FC<ButtonProps>;
  export default Button;
} 