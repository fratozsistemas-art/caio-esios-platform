import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Pricing() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("annual");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const plans = [
    {
      name: "Entry",
      priceMonthly: 97,
      priceAnnual: 970,
      stripePriceIdMonthly: "price_1SgmeqRo0dVPpa4WwvshBsl0",
      stripePriceIdAnnual: "price_1SgmffRo0dVPpa4WzECFaiEL",
      description: "Para começar com Digital Twin",
      features: [
        "1 usuário",
        "Acesso ao Digital Twin",
        "Conversas ilimitadas",
        "Análises básicas",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Basic",
      priceMonthly: 397,
      priceAnnual: 3970,
      stripePriceIdMonthly: "price_1SgmgTRo0dVPpa4WvKYlYGeZ",
      stripePriceIdAnnual: "price_1SgmgnRo0dVPpa4WDwZwIari",
      description: "Para uso profissional",
      features: [
        "1 usuário",
        "Recursos completos do Twin",
        "Análises avançadas",
        "Knowledge Graph access",
        "Suporte prioritário"
      ],
      popular: false
    },
    {
      name: "Teams",
      priceMonthly: 1497,
      priceAnnual: 14970,
      stripePriceIdMonthly: "price_1SgmhJRo0dVPpa4W3H4jN37E",
      stripePriceIdAnnual: "price_1SgmhvRo0dVPpa4WWMA34UFU",
      description: "Para equipes (trimestral no anual)",
      features: [
        "Múltiplos usuários",
        "Tudo do Basic +",
        "Colaboração em equipe",
        "Workspaces ilimitados",
        "Análises colaborativas",
        "Suporte dedicado",
        "Onboarding incluído"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      priceMonthly: "Custom",
      priceAnnual: "Custom",
      description: "For organizations",
      features: [
        "Unlimited users",
        "Everything in Teams +",
        "Hermes Trust-Broker complete",
        "Agent Training & Fine-Tuning",
        "Neo4j Enterprise dedicated",
        "99.9% SLA uptime",
        "SSO (SAML, OAuth)",
        "White-label option",
        "SOC 2, ISO compliance",
        "Unlimited storage",
        "24/7 support + CSM",
        "Custom implementation"
      ],
      popular: false,
      isEnterprise: true
    }
  ];

  const handleCheckout = async (plan) => {
    if (plan.isEnterprise) {
      navigate(createPageUrl("Contato"));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const priceId = billingCycle === "monthly" 
        ? plan.stripePriceIdMonthly 
        : plan.stripePriceIdAnnual;

      const { data } = await base44.functions.invoke('createCheckout', {
        priceId,
        plan: plan.name,
        billingCycle
      });

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to create checkout session');
      setIsLoading(false);
    }
  };

  const getPrice = (plan) => {
    if (plan.isEnterprise) return "Custom";
    return billingCycle === "monthly" ? plan.priceMonthly : plan.priceAnnual;
  };

  const getSavings = (plan) => {
    if (plan.isEnterprise || billingCycle === "monthly") return null;
    const savings = ((plan.priceMonthly - plan.priceAnnual) / plan.priceMonthly * 100).toFixed(0);
    return `Save ${savings}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2540] via-[#1A1D29] to-[#0F1419] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-5xl font-bold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para seu Digital Twin
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-14 h-7 bg-cyan-500/20 rounded-full border border-cyan-500/40 transition-colors"
            >
              <div className={`absolute top-1 ${billingCycle === 'annual' ? 'right-1' : 'left-1'} w-5 h-5 bg-cyan-400 rounded-full transition-all`} />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'text-white font-semibold' : 'text-slate-400'}`}>
              Annual
            </span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Economize até 20%
            </Badge>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold mb-1">Checkout Error</p>
              <p className="text-red-300 text-sm">{error}</p>
              <p className="text-red-300 text-sm mt-2">
                Please make sure your Stripe account is properly configured with the correct API keys.
              </p>
            </div>
          </motion.div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, idx) => {
            const price = getPrice(plan);
            const savings = getSavings(plan);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className={`h-full ${plan.popular ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-500/40 relative' : 'bg-white/5 border-white/10'}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0 px-4 py-1 flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      {typeof price === 'number' ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">${price}</span>
                            <span className="text-slate-400">/month</span>
                          </div>
                          {savings && (
                            <p className="text-sm text-green-400 mt-1">{savings} annually</p>
                          )}
                        </>
                      ) : (
                        <div className="text-4xl font-bold text-white">Contact Sales</div>
                      )}
                    </div>

                    <Button
                      onClick={() => handleCheckout(plan)}
                      disabled={isLoading}
                      className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : plan.isEnterprise ? (
                        'Contact Sales'
                      ) : (
                        'Start Free Trial'
                      )}
                    </Button>

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-slate-400"
        >
          <p>All plans include 14-day free trial · No credit card required · Cancel anytime</p>
          <p className="mt-2">Questions? <a href={createPageUrl("Contato")} className="text-cyan-400 hover:underline">Contact us</a></p>
        </motion.div>
      </div>
    </div>
  );
}