import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Play, Pause, CheckCircle, TrendingUp, Users, Target, BarChart3, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ABTestingDashboard() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const { data: tests = [] } = useQuery({
    queryKey: ['ab_tests'],
    queryFn: () => base44.entities.ABTest.list('-created_date')
  });

  const { data: events = [] } = useQuery({
    queryKey: ['ab_test_events'],
    queryFn: () => base44.entities.ABTestEvent.list('-created_date', 1000)
  });

  const createTestMutation = useMutation({
    mutationFn: (data) => base44.entities.ABTest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ab_tests']);
      setShowCreateDialog(false);
      toast.success('A/B test created successfully');
    }
  });

  const updateTestMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ABTest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ab_tests']);
      toast.success('Test updated successfully');
    }
  });

  const deleteTestMutation = useMutation({
    mutationFn: (id) => base44.entities.ABTest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ab_tests']);
      toast.success('Test deleted successfully');
    }
  });

  const calculateTestResults = (test) => {
    const testEvents = events.filter(e => e.test_id === test.id);
    const variantStats = {};

    test.variants.forEach(variant => {
      const variantEvents = testEvents.filter(e => e.variant_id === variant.id);
      const impressions = variantEvents.filter(e => e.event_type === 'impression').length;
      const conversions = variantEvents.filter(e => e.event_type === 'conversion').length;
      const interactions = variantEvents.filter(e => e.event_type === 'interaction').length;

      variantStats[variant.id] = {
        impressions,
        conversions,
        interactions,
        conversionRate: impressions > 0 ? (conversions / impressions * 100).toFixed(2) : 0,
        engagementRate: impressions > 0 ? (interactions / impressions * 100).toFixed(2) : 0
      };
    });

    return variantStats;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const activeTests = tests.filter(t => t.status === 'active');
  const completedTests = tests.filter(t => t.status === 'completed');

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">A/B Testing Dashboard</h1>
          <p className="text-slate-400">Optimize engagement and feature adoption</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create A/B Test</DialogTitle>
            </DialogHeader>
            <CreateTestForm onSubmit={(data) => createTestMutation.mutate(data)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Tests</p>
                <p className="text-2xl font-bold text-white">{tests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Play className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Tests</p>
                <p className="text-2xl font-bold text-white">{activeTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Events</p>
                <p className="text-2xl font-bold text-white">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-cyan-500/20">
                <CheckCircle className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-white">{completedTests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Tests</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeTests.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No active tests. Create one to get started.</p>
              </CardContent>
            </Card>
          ) : (
            activeTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                stats={calculateTestResults(test)}
                onUpdate={(data) => updateTestMutation.mutate({ id: test.id, data })}
                onDelete={() => deleteTestMutation.mutate(test.id)}
                onSelect={setSelectedTest}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              stats={calculateTestResults(test)}
              onUpdate={(data) => updateTestMutation.mutate({ id: test.id, data })}
              onDelete={() => deleteTestMutation.mutate(test.id)}
              onSelect={setSelectedTest}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TestCard({ test, stats, onUpdate, onDelete, onSelect }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-white mb-2">{test.name}</CardTitle>
              <p className="text-sm text-slate-400">{test.description}</p>
              <div className="flex gap-2 mt-3">
                <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {test.test_type}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {test.status === 'active' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'paused' })}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Pause className="w-4 h-4" />
                </Button>
              )}
              {test.status === 'paused' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ status: 'active' })}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Play className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete()}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {test.variants.map((variant) => {
              const variantStats = stats[variant.id] || {};
              return (
                <div key={variant.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-1">{variant.name}</h4>
                  <p className="text-xs text-slate-400 mb-3">{variant.weight}% traffic</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Impressions</span>
                      <span className="text-white font-medium">{variantStats.impressions || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Conversions</span>
                      <span className="text-white font-medium">{variantStats.conversions || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Conv. Rate</span>
                      <span className="text-green-400 font-medium">{variantStats.conversionRate || 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateTestForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    test_type: 'onboarding',
    status: 'draft',
    variants: [
      { id: 'control', name: 'Control', weight: 50, config: {} },
      { id: 'variant_a', name: 'Variant A', weight: 50, config: {} }
    ],
    target_metrics: [
      { metric_name: 'conversion', metric_type: 'conversion', goal: 'maximize' }
    ],
    audience_criteria: { percentage: 100 }
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-white">Test Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="e.g., Onboarding Flow V2"
        />
      </div>

      <div>
        <Label className="text-white">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-slate-800 border-slate-700 text-white"
          placeholder="What are you testing?"
        />
      </div>

      <div>
        <Label className="text-white">Test Type</Label>
        <Select
          value={formData.test_type}
          onValueChange={(value) => setFormData({ ...formData, test_type: value })}
        >
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="onboarding">Onboarding Flow</SelectItem>
            <SelectItem value="ui_element">UI Element</SelectItem>
            <SelectItem value="ai_module">AI Module</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => onSubmit(formData)}
        className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
      >
        Create Test
      </Button>
    </div>
  );
}