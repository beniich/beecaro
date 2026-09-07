import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Error Boundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false
    });
  };

  private handleCopy = () => {
    const errorDetails = `Error: ${this.state.error?.message || 'Unknown error'}\n\nStack:\n${this.state.error?.stack || 'No stack trace'}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack || 'No component stack'}`;
    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2500);
    }).catch(err => {
      console.error('Failed to copy error to clipboard', err);
    });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white font-mono">
                Erreur Critique
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                L'application a rencontré un problème inattendu et a été isolée par la barrière de sécurité (Error Boundary).
              </p>
            </div>

            {this.state.error && (
              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    {this.state.showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {this.state.showDetails ? 'Masquer les détails techniques' : 'Afficher les détails techniques'}
                  </button>

                  <button
                    type="button"
                    onClick={this.handleCopy}
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs"
                  >
                    {this.state.copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {this.state.copied ? 'Copié !' : 'Copier l\'erreur'}
                  </button>
                </div>

                {this.state.showDetails && (
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg overflow-auto max-h-48 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 space-y-2">
                    <p className="font-semibold text-red-600 dark:text-red-400">{this.state.error.message || this.state.error.toString()}</p>
                    {this.state.error.stack && (
                      <pre className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-medium transition-colors text-sm"
              >
                Réessayer la vue
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
