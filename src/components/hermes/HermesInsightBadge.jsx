import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function HermesInsightBadge({ 
  hermesIntegrityScore, 
  hermesCriticalIssues,
  hermesStatus,
  lastHermesAnalysis,
  showDetails = true 
}) {
  if (!hermesIntegrityScore && !hermesStatus) return null;

  const score = hermesIntegrityScore || 0;
  const status = hermesStatus || (
    score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical'
  );
  const criticalCount = hermesCriticalIssues || 0;

  const statusConfig = {
    healthy: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/30',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/30',
      icon: Info
    },
    critical: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/30',
      icon: AlertTriangle
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Link to={createPageUrl('HermesTrustBroker')}>
      <Badge className={`${config.bg} ${config.text} ${config.border} cursor-pointer hover:opacity-80 transition-opacity`}>
        <Icon className="w-3 h-3 mr-1" />
        Hermes: {Math.round(score)}%
        {criticalCount > 0 && showDetails && (
          <span className="ml-1">({criticalCount} crítico{criticalCount > 1 ? 's' : ''})</span>
        )}
      </Badge>
    </Link>
  );
}