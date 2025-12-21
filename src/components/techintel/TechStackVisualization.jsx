import React from "react";
import { Badge } from "@/components/ui/badge";
import { Code, Server, Cloud, Database, Cpu, Shield } from "lucide-react";

export default function TechStackVisualization({ techStack }) {
  if (!techStack) return null;

  const layers = [
    {
      title: "Frontend",
      icon: Code,
      color: "blue",
      data: techStack.frontend,
      sections: [
        { key: "web_technologies", label: "Web" },
        { key: "mobile_platforms", label: "Mobile" },
        { key: "ui_frameworks", label: "UI Frameworks" }
      ]
    },
    {
      title: "Backend",
      icon: Server || fallbackIcon,
      color: "purple",
      data: techStack.backend,
      sections: [
        { key: "programming_languages", label: "Languages" },
        { key: "frameworks", label: "Frameworks" },
        { key: "api_architecture", label: "API" }
      ]
    },
    {
      title: "Infrastructure",
      icon: Cloud || fallbackIcon,
      color: "cyan",
      data: techStack.infrastructure,
      sections: [
        { key: "cloud_provider", label: "Cloud" },
        { key: "hosting_model", label: "Hosting" },
        { key: "cdn_services", label: "CDN" }
      ]
    },
    {
      title: "Data Layer",
      icon: Database,
      color: "green",
      data: techStack.data_layer,
      sections: [
        { key: "databases", label: "Databases" },
        { key: "data_warehouse", label: "Warehouse" },
        { key: "streaming", label: "Streaming" }
      ]
    },
    {
      title: "AI/ML",
      icon: Cpu || fallbackIcon,
      color: "pink",
      data: techStack.ai_ml_capabilities,
      sections: [
        { key: "ml_frameworks", label: "ML Frameworks" },
        { key: "ai_services", label: "AI Services" },
        { key: "nlp_tools", label: "NLP Tools" }
      ]
    },
    {
      title: "Security",
      icon: Shield || fallbackIcon,
      color: "red",
      data: techStack.security_compliance,
      sections: [
        { key: "authentication", label: "Auth" },
        { key: "encryption", label: "Encryption" },
        { key: "compliance_standards", label: "Compliance" }
      ]
    }
  ];

  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-500",
    pink: "from-pink-500 to-rose-500",
    red: "from-red-500 to-orange-500"
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {layers.map((layer, idx) => {
        const Icon = layer.icon;
        const hasData = layer.data && Object.keys(layer.data).length > 0;
        
        return (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[layer.color]}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white">{layer.title}</h3>
            </div>

            {hasData ? (
              <div className="space-y-3">
                {layer.sections.map((section, sIdx) => {
                  const items = layer.data[section.key];
                  if (!items || items.length === 0) return null;
                  
                  return (
                    <div key={sIdx}>
                      <p className="text-xs text-slate-400 mb-2">{section.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, iIdx) => (
                          <Badge
                            key={iIdx}
                            className="bg-white/5 text-slate-300 border border-white/10 text-xs"
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Não detectado</p>
            )}
          </div>
        );
      })}
    </div>
  );
}