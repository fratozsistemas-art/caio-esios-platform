import React from "react";
import DataSourceManager from "../components/integrations/DataSourceManager";
import AutoGraphBuilder from "../components/integrations/AutoGraphBuilder";
import { Database } from "lucide-react";

export default function Integrations() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-slate-400">Connect external data sources to power your AI analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataSourceManager />
        </div>
        <div>
          <AutoGraphBuilder />
        </div>
      </div>
    </div>
  );
}