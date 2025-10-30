declare module 'sample' {
  export interface WelcomeScreenProps {
    className?: string;
  }

  export interface LoaderProps {
    finishLoading: () => void;
  }

  export const WelcomeScreen: React.FC<WelcomeScreenProps>;
  export const Loader: React.FC<LoaderProps>;
} 