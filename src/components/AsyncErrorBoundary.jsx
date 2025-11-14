import { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { Loader2 } from 'lucide-react';

export default function AsyncErrorBoundary({ 
  children, 
  fallback = <LoadingFallback />,
  onError 
}) {
  return (
    <ErrorBoundary onError={onError}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">Carregando...</p>
        <p className="text-slate-400 text-sm mt-2">Preparando sua experiência</p>
      </div>
    </div>
  );
}