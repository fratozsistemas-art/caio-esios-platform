import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Eye, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ABTestWrapper from '@/components/abtesting/ABTestWrapper';
import { useABTest } from '@/components/abtesting/ABTestProvider';

export default function ABTestDashboardWidget() {
  const navigate = useNavigate();
  const { trackInteraction } = useABTest();

  const { data: tests = [] } = useQuery({
    queryKey: ['ab_tests_active'],
    queryFn: () => base44.entities.ABTest.filter({ status: 'active' }, '-created_date', 5)
  });

  const { data: events = [] } = useQuery({
    queryKey: ['ab_test_events_recent'],
    queryFn: () => base44.entities.ABTestEvent.list('-created_date', 100)
  });

  const calculateQuickStats = (test) => {
    const testEvents = events.filter(e => e.test_id === test.id);
    const impressions = testEvents.filter(e => e.event_type === 'impression').length;
    const conversions = testEvents.filter(e => e.event_type === 'conversion').length;
    const conversionRate = impressions > 0 ? (conversions / impressions * 100).toFixed(1) : 0;

    return { impressions, conversions, conversionRate };
  };

  const handleViewTest = (testId) => {
    trackInteraction('dashboard_widget_layout', 'ab_test_widget_clicked');
    navigate(createPageUrl('ABTestingDashboard'));
  };

  if (tests.length === 0) {
    return (
      <ABTestWrapper testName="dashboard_widget_layout" fallback={null}>
        {(variant) => (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Active A/B Tests
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  {variant?.name || 'Loading'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">No active tests running</p>
                <Button
                  size="sm"
                  onClick={() => navigate(createPageUrl('ABTestingDashboard'))}
                  className="mt-4 bg-purple-600 hover:bg-purple-700"
                >
                  Create Test
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </ABTestWrapper>
    );
  }

  return (
    <ABTestWrapper testName="dashboard_widget_layout" fallback={null}>
      {(variant) => (
        <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Active A/B Tests
                {variant && (
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                    {variant.name}
                  </Badge>
                )}
              </CardTitle>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {tests.length} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tests.map((test) => {
                const stats = calculateQuickStats(test);
                return (
                  <div
                    key={test.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => handleViewTest(test.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">{test.name}</h4>
                        <p className="text-xs text-slate-400 mt-1">{test.test_type}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 h-6 px-2"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Impressions: </span>
                        <span className="text-white font-medium">{stats.impressions}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Conv: </span>
                        <span className="text-white font-medium">{stats.conversions}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Rate: </span>
                        <span className="text-green-400 font-medium">{stats.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(createPageUrl('ABTestingDashboard'))}
              className="w-full mt-3 border-white/20 text-white hover:bg-white/10"
            >
              View All Tests
            </Button>
          </CardContent>
        </Card>
      )}
    </ABTestWrapper>
  );
}