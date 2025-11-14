import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Detect development mode in a compatible way
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('preview'));

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to monitoring service (future: Sentry, LogRocket, etc.)
    if (window.errorLogger) {
      window.errorLogger.logError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isRecurring = this.state.errorCount > 2;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">
                    {isRecurring ? 'Erro Persistente Detectado' : 'Algo deu errado'}
                  </CardTitle>
                  <p className="text-slate-400 text-sm mt-1">
                    {isRecurring 
                      ? 'Este erro ocorreu múltiplas vezes. Recomendamos recarregar a página.'
                      : 'Não se preocupe, estamos trabalhando para resolver isso.'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isDevelopment && this.state.error && (
                <div className="space-y-2">
                  <details className="bg-slate-900/50 rounded-lg p-4">
                    <summary className="text-red-400 font-mono text-sm cursor-pointer">
                      {this.state.error.toString()}
                    </summary>
                    <pre className="mt-4 text-xs text-slate-300 overflow-auto max-h-64">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {!isRecurring && (
                  <Button
                    onClick={this.handleReset}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                )}
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recarregar Página
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir para Início
                </Button>
              </div>

              <p className="text-slate-500 text-xs">
                Erro #{this.state.errorCount} • {new Date().toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;