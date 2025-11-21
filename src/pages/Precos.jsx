import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  Users,
  Building2,
  Sparkles,
  Shield,
  Zap,
  Star,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";
import AccessRequestForm from "../components/landing/AccessRequestForm";
import AccessibilityEnhancer from "../components/AccessibilityEnhancer";

export default function Precos() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("annual");

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = "Preços CAIO·AI - Planos Professional, Teams e Enterprise | A partir de R$ 1.497/mês";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Planos CAIO·AI: Professional (R$ 1.497/mês), Teams (R$ 4.997/mês) e Enterprise (customizado). 14 dias grátis, sem cartão de crédito. Inteligência estratégica enterprise-grade com TSI v9.3.';

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'preços CAIO AI, planos IA empresarial, assinatura inteligência artificial, pricing enterprise, quanto custa CAIO, trial gratuito IA';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + createPageUrl('Precos');

    // Favicon
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png';

    const ogTags = {
      'og:title': 'Preços CAIO·AI - Planos a partir de R$ 1.497/mês',
      'og:description': '14 dias grátis, sem cartão. Professional, Teams e Enterprise. Inteligência estratégica TSI v9.3.',
      'og:url': window.location.origin + createPageUrl('Precos'),
      'og:type': 'website'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "CAIO·AI Platform",
      "description": "Plataforma de Inteligência Estratégica Empresarial",
      "offers": [
        {
          "@type": "Offer",
          "name": "Professional",
          "price": "1497",
          "priceCurrency": "BRL",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Teams",
          "price": "4997",
          "priceCurrency": "BRL",
          "priceValidUntil": "2025-12-31",
          "availability": "https://schema.org/InStock"
        },
        {
          "@type": "Offer",
          "name": "Enterprise",
          "price": "0",
          "priceCurrency": "BRL",
          "description": "Preço customizado",
          "availability": "https://schema.org/InStock"
        }
      ]
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  const plans = [
    {
      name: "Professional",
      icon: Users,
      description: "Para executivos e profissionais independentes",
      price: {
        monthly: 1997,
        annual: 1497
      },
      savings: "25%",
      features: [
        "1 usuário",
        "Acesso completo aos 11 módulos TSI",
        "Chat ilimitado com CAIO (GPT-4, Claude)",
        "80+ Quick Actions",
        "Knowledge Graph (visualização)",
        "File Analyzer (10 arquivos/mês)",
        "Company Intelligence (20 empresas/mês)",
        "5 GB de storage",
        "Suporte por email (24h)"
      ],
      cta: "Começar Trial Gratuito",
      popular: false,
      color: "#00D4FF"
    },
    {
      name: "Teams",
      icon: Building2,
      description: "Para equipes e pequenas empresas",
      price: {
        monthly: 6997,
        annual: 4997
      },
      savings: "29%",
      features: [
        "Até 10 usuários",
        "Tudo do Professional +",
        "Multi-Agent Orchestration ilimitado",
        "Workspaces colaborativos (ilimitado)",
        "File Analyzer ilimitado",
        "Company Intelligence ilimitado",
        "Knowledge Graph (edição completa)",
        "Hermes Trust-Broker (básico)",
        "RBAC e permissões granulares",
        "50 GB de storage",
        "Suporte prioritário (4h)",
        "Onboarding dedicado"
      ],
      cta: "Começar Trial Gratuito",
      popular: true,
      color: "#FFB800"
    },
    {
      name: "Enterprise",
      icon: Shield,
      description: "Para organizações institucionais",
      price: {
        monthly: "Custom",
        annual: "Custom"
      },
      savings: null,
      features: [
        "Usuários ilimitados",
        "Tudo do Teams +",
        "Hermes Trust-Broker completo",
        "Agent Training & Fine-Tuning",
        "Neo4j Enterprise dedicado",
        "SLA 99.9% uptime",
        "SSO (SAML, OAuth)",
        "White-label (opcional)",
        "Compliance (SOC 2, ISO)",
        "Storage ilimitado",
        "Suporte 24/7 + CSM dedicado",
        "Implementação customizada",
        "Treinamento in-company"
      ],
      cta: "Falar com Vendas",
      popular: false,
      color: "#9D4EDD"
    }
  ];

  const faqs = [
    {
      question: "O trial de 14 dias é realmente gratuito?",
      answer: "Sim, 100% gratuito. Sem necessidade de cartão de crédito. Acesso completo a todas as funcionalidades do plano escolhido por 14 dias."
    },
    {
      question: "Posso trocar de plano depois?",
      answer: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. O ajuste é feito pro-rata na próxima fatura."
    },
    {
      question: "Quais formas de pagamento vocês aceitam?",
      answer: "Cartão de crédito (via Stripe), boleto bancário e transferência (planos anuais). Para Enterprise, também oferecemos faturamento por nota fiscal."
    },
    {
      question: "Os dados da minha empresa ficam seguros?",
      answer: "Sim. Todos os dados são criptografados em trânsito (TLS 1.3) e em repouso (AES-256). Compliance SOC 2 Type II e LGPD. Não compartilhamos dados com terceiros."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem multas ou taxas de cancelamento. Planos mensais podem ser cancelados até o último dia do ciclo. Planos anuais têm reembolso pro-rata nos primeiros 30 dias."
    },
    {
      question: "Preciso de treinamento para usar a plataforma?",
      answer: "A plataforma é intuitiva, mas oferecemos onboarding dedicado (Teams+) e treinamento in-company (Enterprise). Também temos documentação completa e tutoriais em vídeo."
    }
  ];

  const addons = [
    {
      name: "Storage Adicional",
      price: "R$ 297/mês",
      description: "50 GB adicionais de storage"
    },
    {
      name: "Usuários Extras",
      price: "R$ 497/usuário/mês",
      description: "Adicione mais usuários ao seu plano Teams"
    },
    {
      name: "Suporte Premium",
      price: "R$ 1.997/mês",
      description: "CSM dedicado + SLA 1h + WhatsApp"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
      <AccessibilityEnhancer />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0A1628]/95 backdrop-blur-xl border-b border-[#00D4FF]/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(createPageUrl('Landing'))}
            >
              <img 
                src="https://base44.app/api/apps/68f4a0b77dcf6281433ddc4b/files/public/68f4a0b77dcf6281433ddc4b/37d64ece6_CAIOAI-semfundo.png" 
                alt="CAIO·AI Logo" 
                className="w-12 h-12 object-contain"
                width="48"
                height="48"
              />
              <div className="text-xl font-bold text-white">CAIO·AI</div>
            </div>
            <div className="flex items-center gap-6">
              <a href={createPageUrl('Sobre')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Sobre</a>
              <a href={createPageUrl('Funcionalidades')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Funcionalidades</a>
              <a href={createPageUrl('Precos')} className="text-[#00D4FF] font-semibold">Preços</a>
              <a href={createPageUrl('Contato')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Contato</a>
              <AccessRequestForm 
                trigger={
                  <Button className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold">
                    Solicitar Acesso
                  </Button>
                }
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00C8FF]/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6 px-6 py-2">
              Preços Transparentes
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-6">
              Planos para Todos os Tamanhos
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
              14 dias grátis, sem cartão de crédito. Cancele quando quiser.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white font-semibold' : 'text-slate-400'}`}>
                Mensal
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-[#00D4FF]/20 rounded-full border border-[#00D4FF]/40 transition-colors"
              >
                <div className={`absolute top-1 ${billingCycle === 'annual' ? 'right-1' : 'left-1'} w-5 h-5 bg-[#00D4FF] rounded-full transition-all`} />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'text-white font-semibold' : 'text-slate-400'}`}>
                Anual
              </span>
              <Badge className="bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40">
                Economize até 29%
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, i) => {
              const Icon = plan.icon;
              const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className={`${plan.popular ? 'bg-gradient-to-br from-[#00D4FF]/20 to-[#FFB800]/20 border-[#FFB800]/60 relative' : 'bg-[#0B0F1A]/50 border-[#00D4FF]/20'} backdrop-blur-sm h-full`}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-[#FFB800] text-[#0A1628] border-[#FFB800] px-4 py-1 flex items-center gap-2">
                          <Star className="w-3 h-3" />
                          MAIS POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ 
                            background: `linear-gradient(135deg, ${plan.color}20, ${plan.color}05)`,
                            boxShadow: `0 0 20px ${plan.color}20`
                          }}
                        >
                          <Icon className="w-6 h-6" style={{ color: plan.color }} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        </div>
                      </div>

                      <p className="text-slate-400 mb-6">{plan.description}</p>

                      <div className="mb-6">
                        {typeof price === 'number' ? (
                          <>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-bold text-white">R$ {price.toLocaleString('pt-BR')}</span>
                              <span className="text-slate-400">/mês</span>
                            </div>
                            {billingCycle === 'annual' && (
                              <p className="text-sm text-[#FFB800] mt-2">
                                Economize {plan.savings} no plano anual
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-4xl font-bold text-white">Sob Consulta</div>
                        )}
                      </div>

                      <AccessRequestForm 
                        trigger={
                          <Button 
                            className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628]' : 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/40 hover:bg-[#00D4FF]/20'} font-semibold`}
                          >
                            {plan.cta}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        }
                      />

                      <div className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-[#00D4FF] flex-shrink-0 mt-0.5" />
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="py-20 bg-[#0B0F1A]/30 border-y border-[#00D4FF]/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Add-ons Disponíveis
            </h2>
            <p className="text-xl text-slate-300">
              Customize seu plano com recursos adicionais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {addons.map((addon, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">{addon.name}</h3>
                      <Sparkles className="w-5 h-5 text-[#FFB800]" />
                    </div>
                    <p className="text-2xl font-bold text-[#00D4FF] mb-3">{addon.price}</p>
                    <p className="text-sm text-slate-400">{addon.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-slate-300">
              Tudo que você precisa saber sobre nossos planos
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-6 h-6 text-[#00D4FF] flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                        <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#00D4FF]/10 via-[#00A8CC]/10 to-transparent">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ainda com Dúvidas?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Fale com nosso time comercial para entender qual plano é ideal para você
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => navigate(createPageUrl('Contato'))}
                className="bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold px-10 py-6 text-lg"
              >
                Falar com Vendas
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <AccessRequestForm 
                trigger={
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-[#00D4FF]/50 bg-transparent text-[#00D4FF] hover:bg-[#00D4FF]/10 px-10 py-6 text-lg"
                  >
                    Começar Trial Gratuito
                  </Button>
                }
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#00D4FF]/20 py-12 bg-[#0A1628]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68f4a0b77dcf6281433ddc4b/4e0fc9a8e_caio_ai_logo_refined.png" 
              alt="CAIO·AI" 
              className="w-10 h-10 object-contain opacity-80"
            />
            <div className="text-xl font-bold text-white">CAIO·AI</div>
          </div>
          <p className="text-sm text-[#00D4FF] mb-4 font-semibold">
            Inteligência que vira tração.
          </p>
          <p className="text-xs text-slate-400">
            © 2025 CAIO·AI Platform. Powered by FRATOZ. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}