import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Loader2,
  MessageSquare,
  Clock,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AccessRequestForm from "../components/landing/AccessRequestForm";

export default function Contato() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'pt-BR';
    document.title = "Contato CAIO·AI - Fale Conosco | Suporte e Vendas";
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'Entre em contato com CAIO·AI: vendas, suporte técnico e parcerias. Resposta em até 24h. Agende uma demo ou tire suas dúvidas sobre nossa plataforma de inteligência estratégica.';

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.name = 'keywords';
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.content = 'contato CAIO AI, suporte CAIO, vendas inteligência artificial, demo CAIO, agendar reunião, falar com vendas, email contato';

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + createPageUrl('Contato');

    const ogTags = {
      'og:title': 'Contato CAIO·AI - Fale Conosco',
      'og:description': 'Vendas, suporte e parcerias. Resposta em até 24h.',
      'og:url': window.location.origin + createPageUrl('Contato'),
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
      "@type": "ContactPage",
      "name": "Contato CAIO·AI",
      "description": "Entre em contato com nossa equipe",
      "url": window.location.origin + createPageUrl('Contato')
    });
    document.head.appendChild(schemaScript);

    return () => {
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        from_name: "CAIO·AI Platform",
        to: "contato@caiovision.com.br",
        subject: `[Contato Site] ${formData.subject}`,
        body: `
          <h2>Novo contato recebido via site</h2>
          <p><strong>Nome:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Empresa:</strong> ${formData.company || 'Não informado'}</p>
          <p><strong>Telefone:</strong> ${formData.phone || 'Não informado'}</p>
          <p><strong>Assunto:</strong> ${formData.subject}</p>
          <p><strong>Mensagem:</strong></p>
          <p>${formData.message.replace(/\n/g, '<br>')}</p>
        `
      });

      setSubmitted(true);
      toast.success("Mensagem enviada com sucesso!");
      
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        subject: "",
        message: ""
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "contato@caiovision.com.br",
      subtext: "Resposta em até 24h úteis",
      color: "#00D4FF"
    },
    {
      icon: MessageSquare,
      title: "Vendas",
      description: "Agende uma demo",
      subtext: "Apresentação personalizada",
      color: "#FFB800",
      action: "demo"
    },
    {
      icon: Shield,
      title: "Suporte Técnico",
      description: "Para clientes ativos",
      subtext: "SLA conforme contrato",
      color: "#9D4EDD"
    }
  ];

  const subjects = [
    "Solicitar Demo",
    "Informações sobre Planos",
    "Suporte Técnico",
    "Parcerias Comerciais",
    "Dúvidas Gerais",
    "Outro"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] via-[#0d2847] to-[#1a1410]">
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
              <a href={createPageUrl('Precos')} className="text-slate-300 hover:text-[#00D4FF] transition-colors">Preços</a>
              <a href={createPageUrl('Contato')} className="text-[#00D4FF] font-semibold">Contato</a>
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
            className="text-center mb-16"
          >
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] border-[#00D4FF]/40 mb-6 px-6 py-2">
              Fale Conosco
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-[#EAF6FF] mb-6">
              Estamos Aqui para Ajudar
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              Entre em contato para demos, dúvidas, suporte ou parcerias comerciais
            </p>
          </motion.div>

          {/* Contact Methods */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactMethods.map((method, i) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm h-full hover:border-[#00D4FF]/50 transition-all cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div 
                        className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                        style={{ 
                          background: `linear-gradient(135deg, ${method.color}20, ${method.color}05)`,
                          boxShadow: `0 0 20px ${method.color}20`
                        }}
                      >
                        <Icon className="w-8 h-8" style={{ color: method.color }} />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                      <p className="text-slate-300 mb-2">{method.description}</p>
                      <p className="text-sm text-slate-500">{method.subtext}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-[#0B0F1A]/50 border-[#00D4FF]/20 backdrop-blur-sm">
              <CardContent className="p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-[#00D4FF]/20 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-[#00D4FF]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Mensagem Enviada!
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Recebemos sua mensagem e retornaremos em breve.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      variant="outline"
                      className="border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/10"
                    >
                      Enviar Outra Mensagem
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nome Completo *
                        </label>
                        <Input
                          required
                          placeholder="Seu nome"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="bg-[#0A1628]/50 border-[#00D4FF]/30 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email *
                        </label>
                        <Input
                          required
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="bg-[#0A1628]/50 border-[#00D4FF]/30 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Empresa
                        </label>
                        <Input
                          placeholder="Nome da empresa"
                          value={formData.company}
                          onChange={(e) => setFormData({...formData, company: e.target.value})}
                          className="bg-[#0A1628]/50 border-[#00D4FF]/30 text-white placeholder:text-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Telefone
                        </label>
                        <Input
                          placeholder="(11) 99999-9999"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="bg-[#0A1628]/50 border-[#00D4FF]/30 text-white placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Assunto *
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-[#0A1628]/50 border border-[#00D4FF]/30 text-white focus:outline-none focus:border-[#00D4FF]"
                      >
                        <option value="">Selecione um assunto</option>
                        {subjects.map((subject, i) => (
                          <option key={i} value={subject}>{subject}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Mensagem *
                      </label>
                      <Textarea
                        required
                        placeholder="Conte-nos como podemos ajudar..."
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="bg-[#0A1628]/50 border-[#00D4FF]/30 text-white placeholder:text-slate-500 min-h-[150px]"
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Responderemos em até 24 horas úteis</span>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#00D4FF] to-[#FFB800] hover:from-[#00E5FF] hover:to-[#FFC520] text-[#0A1628] font-semibold py-6 text-lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
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