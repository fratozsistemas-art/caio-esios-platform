import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const ABTestContext = createContext(null);

export function ABTestProvider({ children }) {
  const [user, setUser] = useState(null);
  const [assignedVariants, setAssignedVariants] = useState({});
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    base44.auth.me()
      .then(u => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const getVariant = async (testName) => {
    if (assignedVariants[testName]) {
      return assignedVariants[testName];
    }

    try {
      const tests = await base44.entities.ABTest.filter({
        name: testName,
        status: 'active'
      });

      if (tests.length === 0) {
        return { variant: null, test: null };
      }

      const test = tests[0];
      
      // Check audience criteria
      if (test.audience_criteria) {
        const criteria = test.audience_criteria;
        
        // Check percentage
        if (criteria.percentage && criteria.percentage < 100) {
          const userHash = hashString(user?.email || sessionId);
          if ((userHash % 100) >= criteria.percentage) {
            return { variant: null, test };
          }
        }

        // Check role
        if (criteria.user_roles?.length > 0 && user?.role) {
          if (!criteria.user_roles.includes(user.role)) {
            return { variant: null, test };
          }
        }
      }

      // Assign variant based on weights
      const variant = selectVariant(test.variants, user?.email || sessionId);

      // Track impression
      await trackEvent(test.id, variant.id, 'impression', 'test_shown');

      const result = { variant, test };
      setAssignedVariants(prev => ({ ...prev, [testName]: result }));
      
      return result;
    } catch (error) {
      console.error('Error getting A/B test variant:', error);
      return { variant: null, test: null };
    }
  };

  const trackEvent = async (testId, variantId, eventType, eventName, eventValue = null, eventData = {}) => {
    if (!user?.email) return;

    try {
      await base44.entities.ABTestEvent.create({
        test_id: testId,
        variant_id: variantId,
        user_email: user.email,
        event_type: eventType,
        event_name: eventName,
        event_value: eventValue,
        event_data: eventData,
        session_id: sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking A/B test event:', error);
    }
  };

  const trackConversion = async (testName, eventName, eventValue = 1, eventData = {}) => {
    const result = assignedVariants[testName];
    if (result?.variant) {
      await trackEvent(result.test.id, result.variant.id, 'conversion', eventName, eventValue, eventData);
    }
  };

  const trackInteraction = async (testName, eventName, eventData = {}) => {
    const result = assignedVariants[testName];
    if (result?.variant) {
      await trackEvent(result.test.id, result.variant.id, 'interaction', eventName, null, eventData);
    }
  };

  return (
    <ABTestContext.Provider value={{ 
      getVariant, 
      trackConversion, 
      trackInteraction,
      assignedVariants,
      sessionId 
    }}>
      {children}
    </ABTestContext.Provider>
  );
}

export function useABTest() {
  const context = useContext(ABTestContext);
  if (!context) {
    throw new Error('useABTest must be used within ABTestProvider');
  }
  return context;
}

// Helper functions
function selectVariant(variants, identifier) {
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 0), 0);
  const hash = hashString(identifier);
  const target = (hash % 100) / 100 * totalWeight;
  
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight || 0;
    if (target <= cumulative) {
      return variant;
    }
  }
  
  return variants[0];
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}