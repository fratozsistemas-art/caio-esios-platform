import React from "react";
import DataSourceManager from "../components/integrations/DataSourceManager";
import AutoGraphBuilder from "../components/integrations/AutoGraphBuilder";
import CrossPlatformInsights from "../components/insights/CrossPlatformInsights";
import NetworkingInsights from "../components/networking/NetworkingInsights";
import IntegrationManagementPanel from "../components/integrations/IntegrationManagementPanel";
import RAGDocumentSearch from "../components/integrations/RAGDocumentSearch";
import SocialMediaConnector from "../components/integrations/SocialMediaConnector";
import ExternalDataHub from "../components/integrations/ExternalDataHub";
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
          <p className="text-slate-400">Connect external data sources for strategic intelligence</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* External Data Hub - Financial, News, Social */}
        <ExternalDataHub />

        {/* RAG Document Search */}
        <RAGDocumentSearch />

        {/* Social Media Connector */}
        <SocialMediaConnector />

        {/* Networking Insights */}
        <NetworkingInsights />
        
        {/* Cross Platform Insights */}
        <CrossPlatformInsights />

        {/* Integration Management Panel */}
        <IntegrationManagementPanel />
        
        {/* Existing Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataSourceManager />
          </div>
          <div>
            <AutoGraphBuilder />
          </div>
        </div>
      </div>
    </div>
  );
}