import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Link as LinkIcon, Save, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const RELATIONSHIP_TYPES = [
  'SIMILAR_TO', 'IMPLEMENTED', 'RESULTED_IN', 'COMPETED_WITH',
  'OPERATES_IN', 'USED_FRAMEWORK', 'ACHIEVED_METRIC', 'FAILED_AT',
  'PIVOTED_FROM', 'ACQUIRED_BY', 'PARTNERED_WITH', 'INFLUENCED'
];

export default function RelationshipEditor({ fromNode = null, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    from_node_id: fromNode?.id || '',
    to_node_id: '',
    relationship_type: 'SIMILAR_TO',
    properties: {
      weight: 1,
      confidence: 100
    }
  });

  const { data: nodes = [] } = useQuery({
    queryKey: ['graphNodes'],
    queryFn: () => base44.entities.KnowledgeGraphNode.list(),
    enabled: isOpen
  });

  const handleSave = async () => {
    if (!formData.from_node_id || !formData.to_node_id) {
      toast.error('Please select both nodes');
      return;
    }

    if (formData.from_node_id === formData.to_node_id) {
      toast.error('Cannot create self-referencing relationship');
      return;
    }

    setIsSaving(true);
    try {
      const savedRel = await base44.entities.KnowledgeGraphRelationship.create(formData);
      toast.success('Relationship created!');
      
      if (onSave) onSave(savedRel);
      setIsOpen(false);
      setFormData({
        from_node_id: fromNode?.id || '',
        to_node_id: '',
        relationship_type: 'SIMILAR_TO',
        properties: { weight: 1, confidence: 100 }
      });
    } catch (error) {
      toast.error('Failed to create relationship');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
          <LinkIcon className="w-4 h-4 mr-2" />
          Add Relationship
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Create Relationship
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* From Node */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              From Node *
            </label>
            {fromNode ? (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-white font-medium">{fromNode.label}</div>
                <Badge className="mt-1 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {fromNode.node_type}
                </Badge>
              </div>
            ) : (
              <Select 
                value={formData.from_node_id} 
                onValueChange={(value) => setFormData({ ...formData, from_node_id: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label} ({node.node_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Relationship Type */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Relationship Type *
            </label>
            <Select 
              value={formData.relationship_type} 
              onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* To Node */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              To Node *
            </label>
            <Select 
              value={formData.to_node_id} 
              onValueChange={(value) => setFormData({ ...formData, to_node_id: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select target node" />
              </SelectTrigger>
              <SelectContent>
                {nodes
                  .filter(node => node.id !== formData.from_node_id)
                  .map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label} ({node.node_type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Weight (0-1)
              </label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.properties.weight}
                onChange={(e) => setFormData({
                  ...formData,
                  properties: { ...formData.properties, weight: parseFloat(e.target.value) }
                })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Confidence (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.properties.confidence}
                onChange={(e) => setFormData({
                  ...formData,
                  properties: { ...formData.properties, confidence: parseInt(e.target.value) }
                })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          {/* Preview */}
          {formData.from_node_id && formData.to_node_id && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white">
                  {nodes.find(n => n.id === formData.from_node_id)?.label}
                </span>
                <span className="text-blue-400">→ {formData.relationship_type} →</span>
                <span className="text-white">
                  {nodes.find(n => n.id === formData.to_node_id)?.label}
                </span>
              </div>
            </div>
          )}

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
              disabled={isSaving || !formData.from_node_id || !formData.to_node_id}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Relationship
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}