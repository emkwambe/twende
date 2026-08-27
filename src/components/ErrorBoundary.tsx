// TWENDE — Global Error Boundary
// Catches React rendering errors and displays a friendly message

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('TWENDE Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg p-6">
          <div className="bg-surface rounded-xl border border-border shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-coral/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-coral">!</span>
            </div>
            <h1 className="text-xl font-bold text-text mb-2">Something went wrong</h1>
            <p className="text-sm text-text2 mb-4">
              The app encountered an unexpected error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="text-left mb-4">
                <summary className="text-xs text-text3 cursor-pointer">Error details</summary>
                <pre className="mt-2 p-3 bg-bg rounded-lg text-xs text-coral overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-ocean text-white rounded-lg text-sm font-medium hover:bg-ocean-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
