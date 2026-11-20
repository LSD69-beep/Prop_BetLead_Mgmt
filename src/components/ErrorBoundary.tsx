import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected runtime error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      let parsedError: { error?: string; operationType?: string; path?: string } | null = null;
      try {
        parsedError = JSON.parse(this.state.errorMessage);
      } catch {
        parsedError = null;
      }

      return (
        <div className="min-h-screen bg-[#F2F5F3] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl bg-white border border-[#D0DDD7] shadow-lg p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#FCE8E0] text-[#B44D27] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-['Playfair_Display'] text-xl font-bold text-[#152226]">
                  Database or Session Notice
                </h1>
                <p className="text-xs text-[#4B5E63]">
                  A protected operation encountered an access or configuration boundary.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F9FBFA] border border-[#D0DDD7] text-xs font-['Red_Hat_Mono'] text-[#152226] break-words">
              {parsedError
                ? `${parsedError.operationType?.toUpperCase() || 'OP'} ${parsedError.path || ''}: ${parsedError.error}`
                : this.state.errorMessage}
            </div>

            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0F4C5C] hover:bg-[#09323D] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload GlassWindow</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
