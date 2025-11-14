import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

export function LoadingCard({ message = 'Loading...', className = '' }) {
  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-12 text-center">
        <LoadingSpinner size="xl" className="text-blue-400 mx-auto mb-4" />
        <p className="text-slate-400">{message}</p>
      </CardContent>
    </Card>
  );
}

export function LoadingOverlay({ message = 'Processing...', show = false }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="bg-slate-900/95 border-white/10 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="xl" className="text-blue-400 mx-auto mb-4" />
          <p className="text-white font-medium">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function LoadingDots({ className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export function LoadingBar({ progress = 0, className = '' }) {
  return (
    <div className={`w-full h-1 bg-slate-800 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className="h-4 bg-slate-800 rounded animate-pulse"
          style={{ width: i === lines - 1 ? '80%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6 space-y-4">
        <div className="h-6 bg-slate-800 rounded animate-pulse w-3/4" />
        <SkeletonText lines={3} />
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-8 w-20 bg-slate-800 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export default {
  LoadingSpinner,
  LoadingCard,
  LoadingOverlay,
  LoadingDots,
  LoadingBar,
  SkeletonText,
  SkeletonCard
};