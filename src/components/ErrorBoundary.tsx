import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="glass-card p-6 w-80 max-w-[90vw] text-center">
            <AlertTriangle className="mx-auto mb-3 text-red-400" size={32} />
            <h2 className="text-sm text-red-400 uppercase tracking-wider mb-2">Something went wrong</h2>
            <p className="text-[0.65rem] text-dark-300 mb-4 leading-relaxed">
              The game ran into an unexpected issue. Your save data is safe.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 rounded border border-red-400/40 text-red-400 text-xs hover:bg-red-400/10 cursor-pointer uppercase tracking-wider transition-all"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
