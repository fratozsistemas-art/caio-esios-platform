import React, { lazy, Suspense } from 'react';
import { LoadingState } from '@/components/ui/LoadingState';

/**
 * Enhanced Lazy Loading with Error Boundary
 */

export function lazyWithRetry(componentImport, retries = 3, interval = 1000) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (retriesLeft) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft === 0) {
              reject(error);
              return;
            }

            console.warn(
              `Failed to load component, retrying... (${retriesLeft} attempts left)`,
              error
            );

            setTimeout(() => {
              attemptLoad(retriesLeft - 1);
            }, interval);
          });
      };

      attemptLoad(retries);
    });
  });
}

/**
 * Lazy load with custom loading component
 */
export function LazyLoad({ 
  children, 
  fallback = <LoadingState message="Loading component..." />,
  errorFallback = <div>Failed to load component</div>
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * Preload component for better UX
 */
export function preloadComponent(componentImport) {
  componentImport();
}

/**
 * Lazy load with prefetch on hover
 */
export function LazyWithPrefetch({ 
  componentImport, 
  children,
  fallback 
}) {
  const [Component, setComponent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleMouseEnter = () => {
    if (!Component && !isLoading) {
      setIsLoading(true);
      componentImport()
        .then(module => {
          setComponent(() => module.default);
          setIsLoading(false);
        })
        .catch(console.error);
    }
  };

  return (
    <div onMouseEnter={handleMouseEnter}>
      {Component ? (
        <Component>{children}</Component>
      ) : (
        fallback || children
      )}
    </div>
  );
}

export default lazyWithRetry;