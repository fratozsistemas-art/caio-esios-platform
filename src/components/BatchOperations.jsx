import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layers, Play, Shield, Trash2, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function BatchOperations({ entityType, entities, onClose }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [operation, setOperation] = useState('hermes_analyze');
  const queryClient = useQueryClient();

  const batchMutation = useMutation({
    mutationFn: async ({ operation, ids }) => {
      if (operation === 'hermes_analyze') {
        const results = [];
        for (const id of ids) {
          const { data } = await base44.functions.invoke('hermesAnalyzeIntegrity', {
            target_entity_type: entityType,
            target_entity_id: id,
            analysis_types: ['narrative_integrity', 'coherence_check']
          });
          results.push(data);
        }
        return results;
      } else if (operation === 'delete') {
        const entityMap = {
          'strategy': 'Strategy',
          'analysis': 'Analysis',
          'workspace': 'Workspace',
          'workflow': 'AgentWorkflow'
        };
        const entityName = entityMap[entityType];
        for (const id of ids) {
          await base44.entities[entityName].delete(id);
        }
        return { deleted: ids.length };
      } else if (operation === 'index_search') {
        for (const id of ids) {
          const entity = entities.find(e => e.id === id);
          await base44.functions.invoke('indexEntityForSearch', {
            entity_type: entityType,
            entity_id: id,
            entity_data: entity
          });
        }
        return { indexed: ids.length };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries();
      toast.success(`Operação em lote concluída: ${selectedIds.length} itens`);
      setSelectedIds([]);
      onClose?.();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    }
  });

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === entities.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entities.map(e => e.id));
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Operações em Lote
          </CardTitle>
          <Badge className="bg-purple-500/20 text-purple-400">
            {selectedIds.length} selecionados
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hermes_analyze">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Análise Hermes
                </div>
              </SelectItem>
              <SelectItem value="index_search">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Indexar para Busca
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2 text-red-400">
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => batchMutation.mutate({ operation, ids: selectedIds })}
            disabled={selectedIds.length === 0 || batchMutation.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Executar
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="flex items-center gap-2 p-2 border-b border-white/10">
            <Checkbox
              checked={selectedIds.length === entities.length && entities.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-slate-400">Selecionar todos</span>
          </div>

          {entities.map(entity => (
            <div
              key={entity.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <Checkbox
                checked={selectedIds.includes(entity.id)}
                onCheckedChange={() => toggleSelection(entity.id)}
              />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {entity.title || entity.name || entity.id}
                </p>
                {entity.status && (
                  <Badge className="bg-blue-500/20 text-blue-400 text-xs mt-1">
                    {entity.status}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}