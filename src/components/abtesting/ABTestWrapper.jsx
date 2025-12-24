import React, { useState, useEffect } from 'react';
import { useABTest } from './ABTestProvider';

export default function ABTestWrapper({ testName, children, fallback = null }) {
  const { getVariant } = useABTest();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVariant(testName).then(result => {
      setVariant(result.variant);
      setLoading(false);
    });
  }, [testName]);

  if (loading) return fallback;
  if (!variant) return fallback;

  // Pass variant config to children
  if (typeof children === 'function') {
    return children(variant);
  }

  // Clone children and inject variant prop
  return React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { variant });
    }
    return child;
  });
}