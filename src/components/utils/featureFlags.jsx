// Feature Flags Management

class FeatureFlagManager {
  constructor() {
    this.flags = new Map();
    this.overrides = new Map();
    this.listeners = new Map();
    this.loadFromStorage();
  }

  // Define default flags
  defineFlags(flags) {
    Object.entries(flags).forEach(([key, config]) => {
      this.flags.set(key, {
        enabled: config.enabled || false,
        description: config.description || '',
        rollout: config.rollout || 100, // Percentage of users
        environments: config.environments || ['development', 'production'],
        dependencies: config.dependencies || []
      });
    });
  }

  // Check if flag is enabled
  isEnabled(flagName, context = {}) {
    // Check local override first (for testing)
    if (this.overrides.has(flagName)) {
      return this.overrides.get(flagName);
    }

    const flag = this.flags.get(flagName);
    if (!flag) {
      console.warn(`Feature flag "${flagName}" not found`);
      return false;
    }

    // Check environment
    const currentEnv = import.meta.env.MODE;
    if (!flag.environments.includes(currentEnv)) {
      return false;
    }

    // Check dependencies
    if (flag.dependencies.length > 0) {
      const allDepsEnabled = flag.dependencies.every(dep => this.isEnabled(dep, context));
      if (!allDepsEnabled) return false;
    }

    // Check rollout percentage (deterministic based on user ID)
    if (context.userId && flag.rollout < 100) {
      const userHash = this.hashString(context.userId);
      const userPercentile = (userHash % 100) + 1;
      if (userPercentile > flag.rollout) {
        return false;
      }
    }

    return flag.enabled;
  }

  // Override flag (for testing)
  override(flagName, value) {
    this.overrides.set(flagName, value);
    this.saveToStorage();
    this.notifyListeners(flagName, value);
  }

  // Clear override
  clearOverride(flagName) {
    this.overrides.delete(flagName);
    this.saveToStorage();
    this.notifyListeners(flagName, this.isEnabled(flagName));
  }

  // Clear all overrides
  clearAllOverrides() {
    this.overrides.clear();
    this.saveToStorage();
    this.flags.forEach((_, key) => {
      this.notifyListeners(key, this.isEnabled(key));
    });
  }

  // Subscribe to flag changes
  subscribe(flagName, callback) {
    if (!this.listeners.has(flagName)) {
      this.listeners.set(flagName, new Set());
    }
    this.listeners.get(flagName).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(flagName);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  // Notify listeners
  notifyListeners(flagName, value) {
    const listeners = this.listeners.get(flagName);
    if (listeners) {
      listeners.forEach(callback => callback(value));
    }
  }

  // Get all flags
  getAllFlags() {
    const result = {};
    this.flags.forEach((config, key) => {
      result[key] = {
        ...config,
        current_value: this.isEnabled(key),
        overridden: this.overrides.has(key)
      };
    });
    return result;
  }

  // Hash string for deterministic rollout
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Persist overrides to localStorage
  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      const overrides = Object.fromEntries(this.overrides);
      localStorage.setItem('feature_flag_overrides', JSON.stringify(overrides));
    } catch (error) {
      console.error('Failed to save feature flags:', error);
    }
  }

  // Load overrides from localStorage
  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('feature_flag_overrides');
      if (stored) {
        const overrides = JSON.parse(stored);
        Object.entries(overrides).forEach(([key, value]) => {
          this.overrides.set(key, value);
        });
      }
    } catch (error) {
      console.error('Failed to load feature flags:', error);
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

// Define application flags
featureFlags.defineFlags({
  // Multi-Agent System
  multi_agent_orchestration: {
    enabled: true,
    description: 'Enable multi-agent + multi-LLM orchestration',
    environments: ['development', 'production'],
    rollout: 100
  },

  // SIU (Strategic Intelligence Unit)
  siu_analysis: {
    enabled: true,
    description: 'Enable SIU deep analysis workflows',
    environments: ['development', 'production'],
    rollout: 100
  },

  // Real-time monitoring
  realtime_monitoring: {
    enabled: false,
    description: 'Enable real-time competitive monitoring',
    environments: ['development', 'production'],
    rollout: 50
  },

  // Knowledge Graph
  knowledge_graph: {
    enabled: true,
    description: 'Enable knowledge graph visualization',
    environments: ['development', 'production'],
    rollout: 100
  },

  // Advanced analytics
  advanced_analytics: {
    enabled: false,
    description: 'Enable advanced analytics dashboard',
    environments: ['development'],
    rollout: 0
  },

  // WhatsApp integration
  whatsapp_integration: {
    enabled: true,
    description: 'Enable WhatsApp agent integration',
    environments: ['production'],
    rollout: 100
  },

  // Experimental features
  experimental_features: {
    enabled: false,
    description: 'Enable experimental/beta features',
    environments: ['development'],
    rollout: 0
  },

  // Performance optimizations
  lazy_loading: {
    enabled: true,
    description: 'Enable lazy loading for routes',
    environments: ['development', 'production'],
    rollout: 100
  },

  // Error tracking
  error_tracking: {
    enabled: true,
    description: 'Enable comprehensive error tracking',
    environments: ['development', 'production'],
    rollout: 100
  }
});

// Convenience method
export const isFeatureEnabled = (flag, context) => featureFlags.isEnabled(flag, context);

// Make available globally in dev
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.featureFlags = featureFlags;
  console.log('🚩 Feature Flags available via window.featureFlags');
}

export default featureFlags;