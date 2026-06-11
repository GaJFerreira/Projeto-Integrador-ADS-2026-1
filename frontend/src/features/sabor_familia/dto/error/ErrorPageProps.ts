export interface ErrorPageProps {
  statusCode?: number;
  message?: string;
  onRetry?: () => void;
}
