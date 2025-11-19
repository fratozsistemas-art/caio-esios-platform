import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AccessRequestForm({ trigger }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha nome e email");
      return;
    }

    setIsSubmitting(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: "demo@caiovision.com.br",
        subject: `🔑 Nova Solicitação de Acesso - ${formData.name}`,
        body: `
Nova solicitação de acesso ao CAIO·AI:

Nome: ${formData.name}
Email: ${formData.email}
Empresa: ${formData.company || "Não informado"}
Cargo: ${formData.role || "Não informado"}

Mensagem:
${formData.message || "Nenhuma mensagem adicional"}

---
Enviado via Landing Page CAIO·AI
        `
      });

      setSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
      
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setFormData({
          name: "",
          email: "",
          company: "",
          role: "",
          message: ""
        });
      }, 3000);

    } catch (error) {
      console.error("Error sending access request:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg" className="bg-gradient-to-r from-cyan-400 to-yellow-400 hover:from-cyan-300 hover:to-yellow-300 text-slate-950 font-semibold">
            <Mail className="w-5 h-5 mr-2" />
            Solicitar Acesso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-xl flex items-center gap-2">
            {submitted ? (
              <>
                <CheckCircle className="w-6 h-6 text-green-400" />
                Solicitação Enviada!
              </>
            ) : (
              <>
                <Mail className="w-6 h-6 text-cyan-400" />
                Solicitar Acesso ao CAIO·AI
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-slate-300 mb-2">
              Sua solicitação foi enviada com sucesso!
            </p>
            <p className="text-sm text-slate-400">
              Nossa equipe entrará em contato em breve.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-200">
                Nome Completo *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Seu nome"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-200">
                Email Corporativo *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-slate-200">
                Empresa
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nome da empresa"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="role" className="text-slate-200">
                Cargo
              </Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Seu cargo"
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div>
              <Label htmlFor="message" className="text-slate-200">
                Mensagem (opcional)
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Por que você gostaria de acessar o CAIO·AI?"
                rows={3}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-cyan-400 to-yellow-400 hover:from-cyan-300 hover:to-yellow-300 text-slate-950 font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </div>

            <p className="text-xs text-slate-400 text-center pt-2">
              Acesso restrito a usuários pré-cadastrados. Entraremos em contato em até 48h.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}