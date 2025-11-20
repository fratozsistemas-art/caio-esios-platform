import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, Send, Info, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function QuickActionAssistantModal({
  open,
  onClose,
  quickAction,
}) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (quickAction) {
      const initialData = {};
      quickAction.data.required_inputs?.forEach((input) => {
        initialData[input.name] = "";
      });
      setFormData(initialData);
      setGeneratedPrompt("");
      setValidationErrors({});
    }
  }, [quickAction]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    if (!quickAction || !quickAction.data.required_inputs) return true;
    
    const errors = {};
    for (const input of quickAction.data.required_inputs) {
      if (input.required && !formData[input.name]?.trim()) {
        errors[input.name] = `${input.label} é obrigatório`;
      }
    }
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error("Preencha todos os campos obrigatórios");
      return false;
    }
    
    return true;
  };

  const constructPrompt = () => {
    if (!quickAction || !validateForm()) return;

    setIsGeneratingPrompt(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      let finalPrompt = quickAction.data.prompt_template;

      // Replace placeholders in prompt_template with form data
      for (const key in formData) {
        const placeholder = `{${key}}`;
        if (finalPrompt.includes(placeholder)) {
          finalPrompt = finalPrompt.replace(new RegExp(placeholder, "g"), formData[key]);
        }
      }

      setGeneratedPrompt(finalPrompt);
      setIsGeneratingPrompt(false);
      toast.success("Prompt gerado com sucesso!");
    }, 500);
  };

  const handleSendToChat = () => {
    if (generatedPrompt) {
      navigate(createPageUrl("Chat"), {
        state: { 
          initialPrompt: generatedPrompt,
          quickActionMetadata: {
            title: quickAction.data.title,
            framework: quickAction.data.primary_framework,
            modules: quickAction.data.modules_activated
          }
        },
      });
      onClose();
    } else {
      toast.error("Por favor, gere o prompt antes de enviar para o chat.");
    }
  };

  const hasRequiredInputs = quickAction?.data.required_inputs?.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-cyan-500/30 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            Assistente: {quickAction?.data.title}
          </DialogTitle>
          <DialogDescription className="text-slate-400 mt-2">
            {hasRequiredInputs 
              ? "Preencha os detalhes para personalizar esta Quick Action. O CAIO irá guiá-lo na análise."
              : "Esta Quick Action está pronta para ser enviada ao CAIO."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {hasRequiredInputs ? (
            quickAction.data.required_inputs.map((input) => (
              <div key={input.name} className="grid gap-2">
                <Label htmlFor={input.name} className="text-slate-300 font-medium">
                  {input.label} {input.required && <span className="text-red-400">*</span>}
                </Label>
                
                {input.type === "text" && (
                  <Input
                    id={input.name}
                    value={formData[input.name] || ""}
                    onChange={(e) => handleChange(input.name, e.target.value)}
                    className={`bg-white/5 border-white/10 text-white ${validationErrors[input.name] ? 'border-red-500' : ''}`}
                    placeholder={input.placeholder || "Digite aqui..."}
                  />
                )}
                
                {input.type === "textarea" && (
                  <Textarea
                    id={input.name}
                    value={formData[input.name] || ""}
                    onChange={(e) => handleChange(input.name, e.target.value)}
                    className={`bg-white/5 border-white/10 text-white min-h-[100px] ${validationErrors[input.name] ? 'border-red-500' : ''}`}
                    placeholder={input.placeholder || "Descreva em detalhes..."}
                  />
                )}
                
                {input.type === "select" && (
                  <Select
                    value={formData[input.name] || ""}
                    onValueChange={(value) => handleChange(input.name, value)}
                  >
                    <SelectTrigger className={`bg-white/5 border-white/10 text-white ${validationErrors[input.name] ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder={input.placeholder || "Selecione uma opção"} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {input.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                
                {validationErrors[input.name] && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors[input.name]}
                  </motion.p>
                )}
              </div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center text-slate-400 flex flex-col items-center justify-center py-8"
            >
              <Info className="w-8 h-8 mb-3 text-cyan-400" />
              <p>Esta Quick Action não requer inputs adicionais.</p>
              <p className="text-sm mt-2">O prompt está pronto para ser gerado e enviado ao CAIO.</p>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <Button
            onClick={constructPrompt}
            disabled={isGeneratingPrompt}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold flex items-center gap-2"
          >
            {isGeneratingPrompt && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGeneratingPrompt ? "Gerando..." : "Gerar Prompt para CAIO"}
          </Button>

          <AnimatePresence>
            {generatedPrompt && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600"
              >
                <Label className="text-slate-300 font-medium">Prompt Gerado:</Label>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="bg-slate-900/50 border-slate-700 text-slate-200 min-h-[120px] font-mono text-sm"
                />
                <Button
                  onClick={handleSendToChat}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Enviar para Chat com CAIO
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}