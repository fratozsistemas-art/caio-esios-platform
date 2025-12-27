import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Zap, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Play,
  Settings
} from 'lucide-react';
import { createPageUrl } from '../utils';
import { Link } from 'react-router-dom';

export default function NetworkAutomationGuide() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          Network Automation Guide
        </h1>
        <p className="text-slate-400 mt-1">
          Learn how to automate network tasks, set up health checks, and respond to incidents
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-white/5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="incidents">Incident Response</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">What is Network Automation?</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <p>
                Network automation allows you to automate repetitive tasks, monitor network health, 
                and respond to incidents automatically. This reduces manual effort and improves reliability.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                  <Zap className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Automations</h3>
                  <p className="text-sm text-slate-400">
                    Create workflows for provisioning, scaling, and maintenance tasks
                  </p>
                </div>
                
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
                  <Activity className="w-8 h-8 text-green-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Health Checks</h3>
                  <p className="text-sm text-slate-400">
                    Monitor network performance and detect issues proactively
                  </p>
                </div>
                
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                  <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                  <h3 className="text-white font-semibold mb-1">Incident Response</h3>
                  <p className="text-sm text-slate-400">
                    Automatically respond to anomalies and critical events
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Link to={createPageUrl('NetworkMap')}>
                  <Button className="bg-cyan-500 hover:bg-cyan-600">
                    Go to Network Map
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Automations */}
        <TabsContent value="automations" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Creating Automations</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <h3 className="text-white font-semibold">Step 1: Choose Automation Type</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Provisioning:</strong> Automatically create and configure network resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Deprovisioning:</strong> Remove unused resources to optimize costs</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Incident Response:</strong> Respond to anomalies and failures automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Health Check:</strong> Run periodic system diagnostics</span>
                </li>
              </ul>

              <h3 className="text-white font-semibold mt-6">Step 2: Configure Triggers</h3>
              <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                <p><strong>Manual:</strong> Execute on demand</p>
                <p><strong>Scheduled:</strong> Run on a cron schedule (e.g., daily at 2am)</p>
                <p><strong>Event-Based:</strong> Trigger when specific events occur</p>
                <p><strong>Threshold:</strong> Activate when metrics exceed limits</p>
                <p><strong>Anomaly Detected:</strong> Run when anomalies are found</p>
              </div>

              <h3 className="text-white font-semibold mt-6">Step 3: Define Workflow Steps</h3>
              <p>Build your automation workflow with actions like:</p>
              <ul className="space-y-1 ml-4">
                <li>• Provision/deprovision nodes</li>
                <li>• Create/update relationships</li>
                <li>• Send alerts and notifications</li>
                <li>• Scale resources up or down</li>
                <li>• Run diagnostics</li>
              </ul>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                <p className="text-sm">
                  <strong>Tip:</strong> Start with simple automations and gradually add complexity. 
                  Use manual trigger for testing before enabling automatic triggers.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Checks */}
        <TabsContent value="health" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Network Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <h3 className="text-white font-semibold">What Gets Checked</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">Performance Metrics</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Latency (response time)</li>
                    <li>• Throughput (data transfer rate)</li>
                    <li>• Packet loss</li>
                    <li>• Error rate</li>
                  </ul>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <h4 className="text-white font-medium mb-2">Network Topology</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Isolated nodes</li>
                    <li>• Overloaded connections</li>
                    <li>• Broken relationships</li>
                    <li>• Connectivity issues</li>
                  </ul>
                </div>
              </div>

              <h3 className="text-white font-semibold mt-6">Health Score Calculation</h3>
              <p>The health score (0-100) is calculated based on:</p>
              <ul className="space-y-2 ml-4">
                <li>• <strong>Network performance:</strong> Latency, packet loss, throughput</li>
                <li>• <strong>Uptime:</strong> System availability percentage</li>
                <li>• <strong>Error rate:</strong> Frequency of failures</li>
                <li>• <strong>Active issues:</strong> Severity and count of problems</li>
              </ul>

              <div className="bg-white/5 rounded-lg p-4 mt-4">
                <h4 className="text-white font-medium mb-2">Status Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400">Healthy</Badge>
                    <span>Score ≥ 90 - Everything is operating normally</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-500/20 text-yellow-400">Degraded</Badge>
                    <span>Score 70-89 - Minor issues, monitoring needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500/20 text-red-400">Critical</Badge>
                    <span>Score &lt; 70 - Immediate attention required</span>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-semibold mt-6">Scheduling Health Checks</h3>
              <p>Health checks can be run:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>On-demand:</strong> Click "Run Check" anytime</li>
                <li>• <strong>Scheduled:</strong> Automatically every hour (recommended)</li>
                <li>• <strong>After changes:</strong> Validate network after modifications</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Incident Response */}
        <TabsContent value="incidents" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Automated Incident Response</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <h3 className="text-white font-semibold">Response Workflow</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                  <div>
                    <h4 className="text-white font-medium">Detection</h4>
                    <p className="text-sm text-slate-400">System detects anomaly or threshold breach</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                  <div>
                    <h4 className="text-white font-medium">Classification</h4>
                    <p className="text-sm text-slate-400">Incident is classified by severity and type</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                  <div>
                    <h4 className="text-white font-medium">Notification</h4>
                    <p className="text-sm text-slate-400">Alert sent to relevant team members</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                  <div>
                    <h4 className="text-white font-medium">Auto-Remediation</h4>
                    <p className="text-sm text-slate-400">Automation workflow attempts to fix the issue</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                  <div>
                    <h4 className="text-white font-medium">Verification</h4>
                    <p className="text-sm text-slate-400">System confirms issue is resolved</p>
                  </div>
                </div>
              </div>

              <h3 className="text-white font-semibold mt-6">Common Incident Types</h3>
              <div className="space-y-2">
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    Connection Failures
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Response: Restart connections, reroute traffic, notify admins
                  </p>
                </div>
                
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Performance Degradation
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Response: Scale resources, optimize routes, clear caches
                  </p>
                </div>
                
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Capacity Issues
                  </h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Response: Auto-scale infrastructure, rebalance load
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Practices */}
        <TabsContent value="best-practices" className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Best Practices</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2">1. Start Small</h3>
                  <p className="text-sm">
                    Begin with simple, low-risk automations. Test thoroughly before deploying to production.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">2. Monitor Everything</h3>
                  <p className="text-sm">
                    Track automation performance, success rates, and execution times. Use this data to improve workflows.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">3. Set Up Notifications</h3>
                  <p className="text-sm">
                    Configure alerts for failures and critical events. Don't rely solely on automation.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">4. Use Retry Logic</h3>
                  <p className="text-sm">
                    Configure retry policies for transient failures. Most issues resolve themselves with a simple retry.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">5. Document Workflows</h3>
                  <p className="text-sm">
                    Keep clear documentation of what each automation does and when it should run.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">6. Regular Reviews</h3>
                  <p className="text-sm">
                    Periodically review automation effectiveness and update as your network evolves.
                  </p>
                </div>
              </div>

              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mt-6">
                <h4 className="text-white font-medium mb-2">Need Help?</h4>
                <p className="text-sm mb-3">
                  Check out our other guides or contact support for assistance with network automation.
                </p>
                <Link to={createPageUrl('HelpCenter')}>
                  <Button variant="outline" className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/20">
                    View All Guides
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}