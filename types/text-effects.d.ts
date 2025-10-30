declare module 'text-effects' {
  export interface TextEffectProps {
    text: string;
    className?: string;
  }

  export const TextEffect: React.FC<TextEffectProps>;
} 