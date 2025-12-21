import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, Mail, Cloud, Server, Briefcase, CheckCircle, Link as LinkIcon, Upload, Download, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function Integrations() {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportTarget, setExportTarget] = useState(null);

  const { data: strategies = [] } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => base44.entities.Strategy.list()
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list()
  });

  const integrations = [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Upload and sync analysis reports and strategies",
      icon: Cloud,
      category: "productivity",
      connector: "googledrive",
      scopes: ["https://www.googleapis.com/auth/drive.file"],
      color: "from-[#4285F4] to-[#34A853]",
      actions: ["export", "import"]
    },
    {
      id: "dropbox",
      name: "Dropbox",
      description: "Connect your Dropbox account for file storage",
      icon: Cloud,
      category: "productivity",
      status: "available",
      color: "from-[#0061FF] to-[#0052CC]"
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Import professional network and company data",
      icon: Share2,
      category: "social",
      status: "connected",
      color: "from-[#0077B5] to-[#00669C]"
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Connect email for communication insights",
      icon: Mail,
      category: "communication",
      status: "available",
      color: "from-[#EA4335] to-[#C5221F]"
    },
    {
      id: "slack",
      name: "Slack",
      description: "Share strategies and analyses with your team",
      icon: Share2,
      category: "communication",
      connector: "slack",
      scopes: ["channels:read", "chat:write", "files:write"],
      color: "from-[#4A154B] to-[#36113A]",
      actions: ["export"]
    },
    {
      id: "notion",
      name: "Notion",
      description: "Export strategies and analyses to Notion databases",
      icon: FileText,
      category: "productivity",
      connector: "notion",
      scopes: [],
      color: "from-[#000000] to-[#2E2E2E]",
      actions: ["export"]
    },
    {
      id: "bloomberg",
      name: "Bloomberg Terminal",
      description: "Professional financial data and analytics",
      icon: Server,
      category: "data",
      status: "enterprise",
      color: "from-[#FFA500] to-[#FF8C00]"
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "CRM data and customer insights",
      icon: Briefcase,
      category: "business",
      status: "available",
      color: "from-[#00A1E0] to-[#0085CA]"
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Marketing and sales automation data",
      icon: Briefcase,
      category: "business",
      status: "available",
      color: "from-[#FF7A59] to-[#FF5C35]"
    }
  ];

  const categories = [
    { id: "all", label: "All" },
    { id: "productivity", label: "Productivity" },
    { id: "social", label: "Social" },
    { id: "communication", label: "Communication" },
    { id: "data", label: "Data Sources" },
    { id: "business", label: "Business Tools" }
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredIntegrations = integrations.filter(integration => 
    selectedCategory === "all" || integration.category === selectedCategory
  );

  const handleConnect = async (integration) => {
    if (!integration.connector) {
      toast.info("This integration is coming soon");
      return;
    }

    try {
      await base44.auth.requestOAuthAuthorization(
        integration.connector,
        `Connect to ${integration.name} to sync data`,
        integration.scopes
      );
      toast.success(`${integration.name} connected successfully`);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error(`Failed to connect to ${integration.name}`);
    }
  };

  const handleExport = async (integration) => {
    setSelectedIntegration(integration);
    setShowExportDialog(true);
  };

  const handleImport = async (integration) => {
    setSelectedIntegration(integration);
    setShowImportDialog(true);
  };

  const executeExport = async () => {
    if (!exportType || !exportTarget) {
      toast.error('Please select what to export');
      return;
    }

    setIsLoading(true);
    try {
      let result;

      if (selectedIntegration.id === 'google-drive') {
        result = await base44.functions.invoke('syncGoogleDrive', {
          action: exportType === 'strategy' ? 'export_analysis' : 'export_analysis',
          data: { 
            analysisId: exportTarget
          }
        });
      } else if (selectedIntegration.id === 'slack') {
        result = await base44.functions.invoke('syncSlack', {
          action: exportType === 'strategy' ? 'share_strategy' : 'share_analysis',
          data: {
            [exportType === 'strategy' ? 'strategyId' : 'analysisId']: exportTarget,
            channel: 'general'
          }
        });
      } else if (selectedIntegration.id === 'notion') {
        result = await base44.functions.invoke('syncNotion', {
          action: exportType === 'strategy' ? 'export_strategy' : 'export_analysis',
          data: {
            [exportType === 'strategy' ? 'strategyId' : 'analysisId']: exportTarget,
            databaseId: 'default'
          }
        });
      }

      if (result.data.success || result.data.fileId) {
        toast.success(`Exported to ${selectedIntegration.name} successfully`);
        setShowExportDialog(false);
        setExportType(null);
        setExportTarget(null);
      } else if (result.data.needsAuth) {
        toast.error(`Please connect ${selectedIntegration.name} first`);
        handleConnect(selectedIntegration);
      } else {
        toast.error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      if (error.message?.includes('not connected')) {
        toast.error(`Please connect ${selectedIntegration.name} first`);
        handleConnect(selectedIntegration);
      } else {
        toast.error('Export failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "connected": return <Badge className="bg-green-400/20 text-green-400">Connected</Badge>;
      case "enterprise": return <Badge className="bg-[#FFB800]/20 text-[#FFB800]">Enterprise</Badge>;
      default: return <Badge className="bg-[#00D4FF]/20 text-[#00D4FF]">Available</Badge>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] flex items-center justify-center">
          <LinkIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-[#94A3B8]">Connect your tools and data sources</p>
        </div>
      </div>

      <Card className="bg-[#1A1D29] border-[#00D4FF]/20 mb-6">
        <CardContent className="p-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.id)}
                className={selectedCategory === cat.id 
                  ? "bg-[#00D4FF] text-[#0A2540] hover:bg-[#00B8E6] font-medium whitespace-nowrap" 
                  : "bg-[#1A1D29] border-[#00D4FF]/30 text-[#94A3B8] hover:bg-[#0A2540] hover:border-[#00D4FF]/50 hover:text-white whitespace-nowrap"}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration, idx) => {
          const Icon = integration.icon;
          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-[#1A1D29] border-[#00D4FF]/20 hover:bg-[#0A2540] transition-all duration-300 h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                  <CardDescription className="text-[#94A3B8]">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto space-y-2">
                  <Button
                    onClick={() => handleConnect(integration)}
                    className="w-full bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540] font-medium"
                  >
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                  
                  {integration.actions?.includes('export') && (
                    <Button
                      onClick={() => handleExport(integration)}
                      variant="outline"
                      className="w-full border-[#00D4FF]/30 text-slate-300 hover:bg-[#00D4FF]/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  )}
                  
                  {integration.actions?.includes('import') && (
                    <Button
                      onClick={() => handleImport(integration)}
                      variant="outline"
                      className="w-full border-[#00D4FF]/30 text-slate-300 hover:bg-[#00D4FF]/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#00D4FF]/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Export to {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">What to export</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strategy">Strategy</SelectItem>
                  <SelectItem value="analysis">Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType && (
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Select {exportType}
                </label>
                <Select value={exportTarget} onValueChange={setExportTarget}>
                  <SelectTrigger className="bg-[#0A2540] border-[#00D4FF]/30 text-white">
                    <SelectValue placeholder={`Select ${exportType}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(exportType === 'strategy' ? strategies : analyses).map(item => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={executeExport}
                disabled={!exportType || !exportTarget || isLoading}
                className="flex-1 bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
                className="border-[#00D4FF]/30 text-slate-300"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="bg-gradient-to-br from-[#0A2540] to-[#1A1D29] border-[#00D4FF]/30">
          <DialogHeader>
            <DialogTitle className="text-white">
              Import from {selectedIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-slate-400">
              Import feature coming soon. You'll be able to import files and data from {selectedIntegration?.name}.
            </p>
            
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              className="w-full border-[#00D4FF]/30 text-slate-300"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}