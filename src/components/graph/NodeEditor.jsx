import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit3, Save, Loader2, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const NODE_TYPES = [
  { value: 'company', label: 'Company' },
  { value: 'industry', label: 'Industry' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'metric', label: 'Metric' },
  { value: 'framework', label: 'Framework' },
  { value: 'outcome', label: 'Outcome' }
];

export default function NodeEditor({ node = null, onSave, trigger }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(node || {
    label: '',
    node_type: 'company',
    properties: {}
  });
  const [newPropertyKey, setNewPropertyKey] = useState('');
  const [newPropertyValue, setNewPropertyValue] = useState('');

  const handleSave = async () => {
    if (!formData.label.trim()) {
      toast.error('Node label is required');
      return;
    }

    setIsSaving(true);
    try {
      let savedNode;
      if (node) {
        savedNode = await base44.entities.KnowledgeGraphNode.update(node.id, formData);
        toast.success('Node updated!');
      } else {
        savedNode = await base44.entities.KnowledgeGraphNode.create(formData);
        toast.success('Node created!');
      }
      
      if (onSave) onSave(savedNode);
      setIsOpen(false);
      setFormData({ label: '', node_type: 'company', properties: {} });
    } catch (error) {
      toast.error('Failed to save node');
    } finally {
      setIsSaving(false);
    }
  };

  const addProperty = () => {
    if (!newPropertyKey.trim()) return;
    
    setFormData({
      ...formData,
      properties: {
        ...formData.properties,
        [newPropertyKey]: newPropertyValue
      }
    });
    setNewPropertyKey('');
    setNewPropertyValue('');
  };

  const removeProperty = (key) => {
    const newProps = { ...formData.properties };
    delete newProps[key];
    setFormData({ ...formData, properties: newProps });
  };

  const TriggerButton = trigger || (
    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
      <Plus className="w-4 h-4 mr-2" />
      {node ? 'Edit Node' : 'Add Node'}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {TriggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {node ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {node ? 'Edit Node' : 'Create New Node'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Node Label */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Node Label *
            </label>
            <Input
              placeholder="e.g., Apple Inc., FinTech, Market Entry Strategy"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Node Type */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Node Type *
            </label>
            <Select 
              value={formData.node_type} 
              onValueChange={(value) => setFormData({ ...formData, node_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Properties */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Properties
            </label>
            
            {/* Existing Properties */}
            {Object.keys(formData.properties || {}).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(formData.properties).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      {key}
                    </Badge>
                    <span className="text-sm text-slate-300 flex-1">{String(value)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProperty(key)}
                      className="h-6 w-6 text-red-400 hover:text-red-300"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Property */}
            <div className="flex gap-2">
              <Input
                placeholder="Property name"
                value={newPropertyKey}
                onChange={(e) => setNewPropertyKey(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <Input
                placeholder="Property value"
                value={newPropertyValue}
                onChange={(e) => setNewPropertyValue(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              />
              <Button
                onClick={addProperty}
                disabled={!newPropertyKey.trim()}
                variant="outline"
                className="border-white/10 text-white"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.label.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {node ? 'Update Node' : 'Create Node'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}