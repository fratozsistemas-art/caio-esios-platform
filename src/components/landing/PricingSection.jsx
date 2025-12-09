import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, Sparkles, Zap, Package } from "lucide-react";
import AccessRequestForm from "./AccessRequestForm";
import { tsiModules } from "./tsiModules";

const plans = [
  {
    name: "Professional",
    price: "$299",
    period: "/month",
    annualPrice: "$2,990/year",
    annualSavings: "Save $598",
    description: "For individual executives and consultants",
    features: [
      "Full TSI v9.3 methodology (11 modules)",
      "Unlimited strategic conversations",
      "Knowledge Graph access",
      "Quick Actions library",
      "Email support",
      "14-day free trial"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Teams",
    price: "$899",
    period: "/month",
    annualPrice: "$8,990/year",
    annualSavings: "Save $1,798",
    description: "For strategic teams (up to 10 seats)",
    features: [
      "Everything in Professional",
      "Up to 10 team seats",
      "Shared workspaces & projects",
      "Advanced collaboration tools",
      "Hermes Trust-Broker governance",
      "Priority support",
      "Custom integrations",
      "Dedicated success manager"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations requiring full customization",
    features: [
      "Everything in Teams",
      "Unlimited seats",
      "Custom module development",
      "Private deployment options",
      "SLA guarantees",
      "24/7 white-glove support",
      "Executive training program",
      "Quarterly strategic reviews"
    ],
    cta: "Contact Sales",
    popular: false,
    isEnterprise: true
  }
];

const modulesPricing = tsiModules.map((module, idx) => ({
  ...module,
  price: module.id === "M5" ? "$199" : "$99",
  period: "/month",
  oneTimePrice: module.id === "M5" ? "$1,990" : "$990",
  description: module.description,
  featured: module.id === "M5"
}));

const bundles = [
  {
    id: "strategic-core",
    name: "Strategic Core",
    modules: ["M1", "M2", "M5"],
    price: "$249",
    period: "/month",
    oneTimePrice: "$2,490",
    savings: "Save $48/mo",
    description: "Essential modules for strategic analysis",
    icon: Sparkles,
    color: "#00C8FF"
  },
  {
    id: "execution-suite",
    name: "Execution Suite",
    modules: ["M5", "M7", "M11"],
    price: "$249",
    period: "/month",
    oneTimePrice: "$2,490",
    savings: "Save $48/mo",
    description: "From strategy to implementation",
    icon: Zap,
    color: "#16A9FF"
  },
  {
    id: "capital-intelligence",
    name: "Capital Intelligence",
    modules: ["M4", "M6", "M9"],
    price: "$249",
    period: "/month",
    oneTimePrice: "$2,490",
    savings: "Save $48/mo",
    description: "Financial modeling & funding strategy",
    icon: Package,
    color: "#FFC247"
  },
  {
    id: "complete-tsi",
    name: "Complete TSI",
    modules: ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11"],
    price: "$799",
    period: "/month",
    oneTimePrice: "$7,990",
    savings: "Save $290/mo",
    description: "Full TSI v9.3 methodology",
    icon: Sparkles,
    color: "#E0A43C",
    popular: true
  }
];

export default function PricingSection() {
  const [activeTab, setActiveTab] = useState("plans");
  const [billingCycle, setBillingCycle] = useState("monthly");

  return (
    <section id="pricing" className="py-20 md:py-32 bg-white/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-8">
            Choose your plan, select individual modules, or get a bundle. No credit card required for trial.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00D4FF]/20 border border-[#00D4FF]/40 text-[#00E5FF] text-sm font-medium shadow-lg">
            <CheckCircle className="w-4 h-4" />
            14-Day Free Trial · 30-Day Money-Back Guarantee
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 bg-white/5 border border-white/10 p-1 rounded-xl" role="tablist" aria-label="Pricing options">
            <TabsTrigger 
              value="plans" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C8FF] data-[state=active]:to-[#16A9FF] data-[state=active]:text-white text-slate-300 rounded-lg transition-all"
              role="tab"
              aria-label="View subscription plans"
            >
              <Package className="w-4 h-4 mr-2" aria-hidden="true" />
              Plans
            </TabsTrigger>
            <TabsTrigger 
              value="modules" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#16A9FF] data-[state=active]:to-[#FFC247] data-[state=active]:text-white text-slate-300 rounded-lg transition-all"
              role="tab"
              aria-label="View individual modules"
            >
              <Sparkles className="w-4 h-4 mr-2" aria-hidden="true" />
              Modules
            </TabsTrigger>
            <TabsTrigger 
              value="bundles" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFC247] data-[state=active]:to-[#E0A43C] data-[state=active]:text-white text-slate-300 rounded-lg transition-all"
              role="tab"
              aria-label="View module bundles"
            >
              <Zap className="w-4 h-4 mr-2" aria-hidden="true" />
              Bundles
            </TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#00C8FF] to-[#FFC247] text-white text-xs font-bold">
                        MOST POPULAR
                      </div>
                    </div>
                  )}
                  <Card className={`h-full ${plan.popular ? 'bg-gradient-to-b from-[#00C8FF]/10 to-[#FFC247]/10 border-[#00C8FF]/30' : 'bg-white/5 border-white/10'} backdrop-blur-sm`}>
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1 mb-1">
                          <span className="text-5xl font-bold text-white">{plan.price}</span>
                          {plan.period && <span className="text-slate-400">{plan.period}</span>}
                        </div>
                        {plan.annualPrice && !plan.isEnterprise && (
                          <div className="text-sm text-slate-400">
                            or {plan.annualPrice} <span className="text-green-400">({plan.annualSavings})</span>
                          </div>
                        )}
                      </div>

                      <AccessRequestForm 
                        trigger={
                          <Button
                            size="lg"
                            className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628]' : 'bg-white/10 hover:bg-white/20 text-white border border-[#00D4FF]/30'}`}
                          >
                            {plan.cta}
                          </Button>
                        }
                      />

                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules">
            <div className="text-center mb-8">
              <p className="text-slate-300">Build your own intelligence stack by selecting individual TSI modules</p>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {modulesPricing.map((module, i) => {
                const Icon = module.icon;
                const moduleColor = parseInt(module.id.slice(1)) % 2 === 0 ? "#FFC247" : "#00C8FF";
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <Card 
                      className={`h-full ${module.featured ? 'bg-gradient-to-br from-[#00C8FF]/20 to-[#FFC247]/20 border-[#FFC247]/60' : 'bg-white/5 border-white/10'} backdrop-blur-sm hover:border-[#00C8FF]/50 transition-all`}
                      style={{ boxShadow: module.featured ? '0 0 30px rgba(255, 194, 71, 0.3)' : '0 0 20px rgba(0, 200, 255, 0.1)' }}
                    >
                      <CardContent className="p-6">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                          style={{ 
                            background: `linear-gradient(135deg, ${moduleColor}20, ${moduleColor}10)`,
                            boxShadow: `0 0 20px ${moduleColor}30`
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: moduleColor }} />
                        </div>
                        
                        <Badge className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/30 text-xs mb-3">
                          {module.id}
                        </Badge>
                        {module.featured && (
                          <Badge className="bg-[#FFC247]/20 text-[#FFC247] border-[#FFC247]/30 text-xs ml-2 mb-3">
                            CORE
                          </Badge>
                        )}

                        <h3 className="font-bold text-white text-base mb-2">{module.name}</h3>
                        <p className="text-xs text-slate-400 mb-4 leading-relaxed">{module.description}</p>

                        <div className="mb-4">
                          <div className="text-2xl font-bold text-white">{module.price}</div>
                          <div className="text-xs text-slate-400">{module.period}</div>
                          <div className="text-xs text-slate-500 mt-1">or {module.oneTimePrice} one-time</div>
                        </div>

                        <AccessRequestForm 
                          trigger={
                            <Button 
                              size="sm" 
                              className="w-full bg-white/10 hover:bg-white/20 text-white border border-[#00C8FF]/30"
                            >
                              Add Module
                            </Button>
                          }
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Bundles Tab */}
          <TabsContent value="bundles">
            <div className="text-center mb-8">
              <p className="text-slate-300">Pre-configured module combinations for specific use cases</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {bundles.map((bundle, i) => {
                const Icon = bundle.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative"
                  >
                    {bundle.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-[#00C8FF] to-[#FFC247] text-white text-xs font-bold">
                          BEST VALUE
                        </div>
                      </div>
                    )}
                    <Card 
                      className={`h-full ${bundle.popular ? 'bg-gradient-to-br from-[#00C8FF]/20 to-[#FFC247]/20 border-[#FFC247]/60' : 'bg-white/5 border-white/10'} backdrop-blur-sm`}
                      style={{ boxShadow: bundle.popular ? '0 0 40px rgba(255, 194, 71, 0.3)' : '0 0 20px rgba(0, 200, 255, 0.1)' }}
                    >
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                            <p className="text-sm text-slate-400 mb-4">{bundle.description}</p>
                          </div>
                          <div 
                            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${bundle.color}20, ${bundle.color}10)`,
                              boxShadow: `0 0 20px ${bundle.color}30`
                            }}
                          >
                            <Icon className="w-7 h-7" style={{ color: bundle.color }} />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {bundle.modules.map((moduleId) => (
                            <Badge 
                              key={moduleId}
                              className="bg-[#00C8FF]/20 text-[#00C8FF] border-[#00C8FF]/30"
                            >
                              {moduleId}
                            </Badge>
                          ))}
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-4xl font-bold text-white">{bundle.price}</span>
                            <span className="text-slate-400">{bundle.period}</span>
                          </div>
                          <div className="text-sm text-green-400 mb-2">{bundle.savings}</div>
                          <div className="text-xs text-slate-500">or {bundle.oneTimePrice} one-time</div>
                        </div>

                        <AccessRequestForm 
                          trigger={
                            <Button
                              size="lg"
                              className={`w-full ${bundle.popular ? 'bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628]' : 'bg-white/10 hover:bg-white/20 text-white border border-[#00D4FF]/30'}`}
                            >
                              Get Bundle
                            </Button>
                          }
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-400">
            All plans include 14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}