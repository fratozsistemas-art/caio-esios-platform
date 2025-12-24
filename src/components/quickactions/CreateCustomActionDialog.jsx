import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CreateCustomActionDialog({ onActionCreated }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Custom',
    prompt_template: '',
    is_public: false,
    expected_outputs: [],
    required_inputs: []
  });

  const [newOutput, setNewOutput] = useState('');
  const [newInput, setNewInput] = useState({
    name: '',
    label: '',
    type: 'text',
    placeholder: '',
    required: true
  });

  const handleAddOutput = () => {
    if (newOutput.trim()) {
      setFormData({
        ...formData,
        expected_outputs: [...formData.expected_outputs, newOutput.trim()]
      });
      setNewOutput('');
    }
  };

  const handleRemoveOutput = (index) => {
    setFormData({
      ...formData,
      expected_outputs: formData.expected_outputs.filter((_, i) => i !== index)
    });
  };

  const handleAddInput = () => {
    if (newInput.name && newInput.label) {
      setFormData({
        ...formData,
        required_inputs: [...formData.required_inputs, { ...newInput }]
      });
      setNewInput({
        name: '',
        label: '',
        type: 'text',
        placeholder: '',
        required: true
      });
    }
  };

  const handleRemoveInput = (index) => {
    setFormData({
      ...formData,
      required_inputs: formData.required_inputs.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const action = await base44.entities.CustomQuickAction.create(formData);
      toast.success('Ação personalizada criada!');
      onActionCreated?.(action);
      setOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'Custom',
        prompt_template: '',
        is_public: false,
        expected_outputs: [],
        required_inputs: []
      });
    } catch (error) {
      console.error('Error creating custom action:', error);
      toast.error('Erro ao criar ação personalizada');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Criar Ação Personalizada
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Nova Ação Personalizada
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label className="text-white">Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Análise de Concorrência Personalizada"
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <Label className="text-white">Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que esta ação faz..."
                className="bg-slate-800 border-slate-700 text-white h-20"
              />
            </div>

            <div>
              <Label className="text-white">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Strategy">Strategy</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Prompt Template</Label>
              <Textarea
                value={formData.prompt_template}
                onChange={(e) => setFormData({ ...formData, prompt_template: e.target.value })}
                placeholder="Use {input_name} para referenciar inputs. Ex: Analise {company_name} no mercado de {industry}"
                className="bg-slate-800 border-slate-700 text-white h-32"
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Use chaves para referenciar inputs: {'{'}nome_do_input{'}'}
              </p>
            </div>
          </div>

          {/* Required Inputs */}
          <div className="border border-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-semibold">Inputs Necessários</h3>
            
            {formData.required_inputs.map((input, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-800 p-3 rounded">
                <div className="flex-1">
                  <span className="text-white text-sm font-medium">{input.label}</span>
                  <span className="text-slate-400 text-xs ml-2">({input.type})</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveInput(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Nome (ex: company_name)"
                value={newInput.name}
                onChange={(e) => setNewInput({ ...newInput, name: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Input
                placeholder="Label (ex: Nome da Empresa)"
                value={newInput.label}
                onChange={(e) => setNewInput({ ...newInput, label: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Select value={newInput.type} onValueChange={(value) => setNewInput({ ...newInput, type: value })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddInput} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Input
              </Button>
            </div>
          </div>

          {/* Expected Outputs */}
          <div className="border border-slate-700 rounded-lg p-4 space-y-4">
            <h3 className="text-white font-semibold">Entregas Esperadas</h3>
            
            {formData.expected_outputs.map((output, index) => (
              <div key={index} className="flex items-center gap-2 bg-slate-800 p-3 rounded">
                <span className="text-white text-sm flex-1">{output}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveOutput(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Nova entrega esperada..."
                value={newOutput}
                onChange={(e) => setNewOutput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOutput())}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <Button type="button" onClick={handleAddOutput} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg">
            <div>
              <Label className="text-white">Tornar Pública</Label>
              <p className="text-xs text-slate-400">Outros usuários poderão ver e usar esta ação</p>
            </div>
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700">
              Cancelar
            </Button>
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
              Criar Ação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}