import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCode, Package, AlertTriangle, CheckCircle, Download } from "lucide-react";

export default function ComponentDetailModal({ component, open, onClose }) {
  if (!component) return null;

  const exportComponentData = () => {
    const data = {
      name: component.name,
      path: component.path,
      status: component.status,
      imports: component.imports,
      dependencies: component.dependencies,
      issues: component.issues,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${component.name}_details.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-[#0A1628] border-white/20 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCode className="w-6 h-6 text-cyan-400" />
              <span>{component.name}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={exportComponentData}
              className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
            <TabsTrigger value="imports">Imports</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Path</div>
                  <div className="font-mono text-sm text-white bg-white/5 p-2 rounded">
                    {component.path}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Status</div>
                  <Badge className={`${
                    component.status === 'healthy' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                    component.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                    'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {component.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {component.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {component.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Total Imports</div>
                    <div className="text-2xl font-bold text-white">{component.imports}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Dependencies</div>
                    <div className="text-2xl font-bold text-white">{component.dependencies?.length || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dependencies" className="mt-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="space-y-2">
                  {component.dependencies?.map((dep, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <Package className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-mono text-sm flex-1">{dep}</span>
                      <Badge variant="outline" className="border-white/20 text-slate-400">
                        npm
                      </Badge>
                    </div>
                  )) || <p className="text-slate-400 text-sm">No dependencies</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imports" className="mt-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="text-sm text-slate-300 space-y-2">
                  <p className="text-slate-400">Total imports: <span className="text-white font-semibold">{component.imports}</span></p>
                  <div className="mt-4 p-4 bg-white/5 rounded border border-white/10">
                    <p className="text-xs text-slate-500 mb-2">Estimated import breakdown:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">React & Hooks</span>
                        <span className="text-white">~{Math.floor(component.imports * 0.2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">UI Components</span>
                        <span className="text-white">~{Math.floor(component.imports * 0.4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Icons</span>
                        <span className="text-white">~{Math.floor(component.imports * 0.25)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Utilities</span>
                        <span className="text-white">~{Math.floor(component.imports * 0.15)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="mt-4">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                {component.issues?.length > 0 ? (
                  <div className="space-y-3">
                    {component.issues.map((issue, idx) => (
                      <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start gap-3">
                          {issue.severity === 'error' ? (
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`text-xs ${
                                issue.severity === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}>
                                {issue.type}
                              </Badge>
                              <Badge className={`text-xs ${
                                issue.severity === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                              }`}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-200">{issue.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <p className="text-slate-400">No issues detected</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}