import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Activity, History, Settings } from "lucide-react";
import AlertRuleManager from "../components/alerts/AlertRuleManager";
import AlertHistory from "../components/alerts/AlertHistory";
import AlertDashboard from "../components/alerts/AlertDashboard";

export default function AlertsManagement() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-amber-400" />
            Sistema de Alertas
          </h1>
          <p className="text-slate-400 mt-1">
            Configure e monitore alertas críticos da plataforma
          </p>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2">
          AI-Powered Monitoring
        </Badge>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Activity className="w-4 h-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <Settings className="w-4 h-4 mr-2" />
            Regras
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400">
            <History className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AlertDashboard />
        </TabsContent>

        <TabsContent value="rules">
          <AlertRuleManager />
        </TabsContent>

        <TabsContent value="history">
          <AlertHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}