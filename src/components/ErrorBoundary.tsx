import React, { Component, ErrorInfo, ReactNode } from 'react';
import GlassCard from './GlassCard';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally reload the page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{
            background: 'linear-gradient(to bottom right, #78350f 0%, #451a03 30%, #1c1917 70%, #000000 100%)',
          }}
        >
          <div className="max-w-2xl w-full">
            <GlassCard>
              <div className="text-center space-y-6">
                <div className="text-6xl">⚠️</div>
                <h1 className="text-white text-3xl font-bold">Oops! Something went wrong</h1>
                <p className="text-white/80 text-lg">
                  Don't worry, your data is safe. The app encountered an unexpected error.
                </p>

                {this.state.error && (
                  <div className="bg-red-950/50 border border-red-500/30 rounded-xl p-4 text-left">
                    <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
                    <p className="text-red-300/80 text-sm font-mono break-words">
                      {this.state.error.toString()}
                    </p>
                    {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                      <details className="mt-3">
                        <summary className="text-red-400 text-sm cursor-pointer hover:text-red-300">
                          Stack Trace (Development Only)
                        </summary>
                        <pre className="text-red-300/70 text-xs mt-2 overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-amber-500/30 border-2 border-amber-400/50 rounded-xl text-white font-semibold hover:bg-amber-500/40 transition-all"
                  >
                    Reload Page
                  </button>
                  <button
                    onClick={this.handleReset}
                    className="px-6 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Return Home
                  </button>
                </div>

                <p className="text-white/50 text-sm">
                  If this problem persists, please export your data from Settings and contact support.
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
