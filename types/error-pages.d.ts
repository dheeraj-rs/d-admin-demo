declare module 'error-pages' {
  export interface ErrorPageProps {
    statusCode?: number;
    message?: string;
  }

  export const ErrorPage: React.FC<ErrorPageProps>;
} 