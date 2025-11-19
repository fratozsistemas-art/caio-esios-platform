import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../landing/AccessRequestForm";

export default function PricingCard({ plan, index }) {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    // All plans now redirect to access request form
    return;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative"
    >
      {plan.popular && (
        <div className="absolute -top-4 left-0 right-0 flex justify-center">
          <div className="px-4 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold">
            MOST POPULAR
          </div>
        </div>
      )}
      <Card className={`h-full ${plan.popular ? 'bg-gradient-to-b from-blue-500/10 to-purple-500/10 border-blue-500/30' : 'bg-white/5 border-white/10'} backdrop-blur-sm`}>
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
          
          {!plan.isCustom && !plan.isEnterprise && plan.priceIds && (
            <div className="flex gap-2 mb-6">
              <Button
                variant={billingCycle === "monthly" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingCycle("monthly")}
                className={billingCycle === "monthly" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white/5 border-white/20 text-white"
                }
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === "annual" ? "default" : "outline"}
                size="sm"
                onClick={() => setBillingCycle("annual")}
                className={billingCycle === "annual" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white/5 border-white/20 text-white"
                }
              >
                Annual
              </Button>
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-white">{plan.price}</span>
              {plan.period && <span className="text-slate-400">{plan.period}</span>}
            </div>
            {billingCycle === "annual" && plan.annualPrice && !plan.isEnterprise && !plan.isCustom && (
              <div className="text-sm text-slate-400">
                or {plan.annualPrice}/year <span className="text-green-400">({plan.annualSavings})</span>
              </div>
            )}
            {plan.isCustom && (
              <div className="text-sm text-slate-400">
                Pricing tailored to your needs
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
  );
}