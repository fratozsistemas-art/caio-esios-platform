import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Mail, Cloud, Database, Briefcase, CheckCircle, Link as LinkIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function Integrations() {
  const integrations = [
    {
      id: "google-drive",
      name: "Google Drive",
      description: "Sync files and documents from Google Drive",
      icon: Cloud,
      category: "productivity",
      status: "available",
      color: "from-[#4285F4] to-[#34A853]"
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
      description: "Integrate team communications and channels",
      icon: Share2,
      category: "communication",
      status: "available",
      color: "from-[#4A154B] to-[#36113A]"
    },
    {
      id: "bloomberg",
      name: "Bloomberg Terminal",
      description: "Professional financial data and analytics",
      icon: Database,
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

  const handleConnect = (integration) => {
    if (integration.status === "enterprise") {
      toast.info("Enterprise plan required for this integration");
    } else if (integration.status === "connected") {
      toast.success("Already connected");
    } else {
      toast.info(`Connecting to ${integration.name}...`);
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
                <CardContent className="mt-auto">
                  <Button
                    onClick={() => handleConnect(integration)}
                    className={integration.status === "connected" 
                      ? "w-full bg-green-400/20 text-green-400 hover:bg-green-400/30 border border-green-400/30" 
                      : "w-full bg-[#00D4FF] hover:bg-[#00B8E6] text-[#0A2540] font-medium"}
                  >
                    {integration.status === "connected" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Connected
                      </>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}