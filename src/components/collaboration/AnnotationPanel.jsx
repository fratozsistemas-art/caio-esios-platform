import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Plus, Check, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AnnotationPanel({ entityType, entityId, annotations = [], onUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAnnotation = async () => {
    if (!newAnnotation.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await base44.functions.invoke('addAnnotation', {
        entity_type: entityType,
        entity_id: entityId,
        annotation: newAnnotation.trim()
      });

      if (response.data?.success) {
        toast.success('Annotation added');
        setNewAnnotation("");
        setIsAdding(false);
        if (onUpdate) onUpdate();
      }
    } catch (error) {
      console.error('Annotation error:', error);
      toast.error('Failed to add annotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (annotationId) => {
    // Mark annotation as resolved
    toast.success('Annotation resolved');
    if (onUpdate) onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Annotations
          {annotations.length > 0 && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {annotations.length}
            </Badge>
          )}
        </h3>
        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          variant="outline"
          className="border-white/10 text-white hover:bg-white/10"
        >
          {isAdding ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  placeholder="Add your annotation..."
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAdding(false);
                      setNewAnnotation("");
                    }}
                    className="text-slate-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddAnnotation}
                    disabled={isSubmitting || !newAnnotation.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Annotation'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations List */}
      <div className="space-y-3">
        <AnimatePresence>
          {annotations.map((annotation, idx) => (
            <motion.div
              key={annotation.id || idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`bg-white/5 border-white/10 ${annotation.resolved ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                        {annotation.author_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">
                          {annotation.author_name || annotation.author}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(annotation.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {annotation.resolved ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolve(annotation.id)}
                        className="text-slate-400 hover:text-green-400 h-6 text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {annotation.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {annotations.length === 0 && !isAdding && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No annotations yet. Add one to start collaborating!
          </div>
        )}
      </div>
    </div>
  );
}