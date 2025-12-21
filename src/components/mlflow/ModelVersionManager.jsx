import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Tag, Edit, ArrowRight, CheckCircle, Clock, Archive } from "lucide-react";
import { motion } from "framer-motion";

export default function ModelVersionManager({ model }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [description, setDescription] = useState("");
  const [tagKey, setTagKey] = useState("");
  const [tagValue, setTagValue] = useState("");
  const queryClient = useQueryClient();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ['mlflow_model_versions', model?.name],
    queryFn: async () => {
      if (!model) return [];
      const { data } = await base44.functions.invoke('mlflowClient', {
        action: 'getModelVersions',
        data: { model_name: model.name }
      });
      return data.versions;
    },
    enabled: !!model
  });

  const transitionStageMutation = useMutation({
    mutationFn: async ({ version, stage }) => {
      return base44.functions.invoke('mlflowClient', {
        action: 'transitionModelVersionStage',
        data: {
          model_name: model.name,
          version,
          stage
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlflow_model_versions'] });
    }
  });

  const updateDescriptionMutation = useMutation({
    mutationFn: async ({ version, description }) => {
      return base44.functions.invoke('mlflowClient', {
        action: 'updateModelVersion',
        data: {
          model_name: model.name,
          version,
          description
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlflow_model_versions'] });
      setShowEditDialog(false);
      setDescription("");
    }
  });

  const addTagMutation = useMutation({
    mutationFn: async ({ version, key, value }) => {
      return base44.functions.invoke('mlflowClient', {
        action: 'setModelVersionTag',
        data: {
          model_name: model.name,
          version,
          key,
          value
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mlflow_model_versions'] });
      setShowTagDialog(false);
      setTagKey("");
      setTagValue("");
    }
  });

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'Production': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Staging': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Archived': return <Archive className="w-4 h-4 text-slate-400" />;
      default: return <Package className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Production': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Staging': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Archived': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  if (!model) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select a model to manage versions</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              {model.name} - Versions
            </span>
            <Badge variant="outline" className="border-white/20 text-slate-300">
              {versions.length} versions
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <p className="text-slate-400">Loading versions...</p>
          </CardContent>
        </Card>
      ) : versions.length === 0 ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No versions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {versions.map((version, idx) => (
            <motion.div
              key={version.version}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStageIcon(version.current_stage)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">Version {version.version}</span>
                          <Badge className={getStageColor(version.current_stage)}>
                            {version.current_stage}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Created {new Date(parseInt(version.creation_timestamp)).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showEditDialog && selectedVersion?.version === version.version} onOpenChange={(open) => {
                        setShowEditDialog(open);
                        if (open) {
                          setSelectedVersion(version);
                          setDescription(version.description || "");
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A1628] border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Version {version.version}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Description"
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                              onClick={() => updateDescriptionMutation.mutate({ version: version.version, description })}
                              disabled={updateDescriptionMutation.isPending}
                              className="w-full bg-cyan-600 hover:bg-cyan-700"
                            >
                              {updateDescriptionMutation.isPending ? 'Updating...' : 'Update'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showTagDialog && selectedVersion?.version === version.version} onOpenChange={(open) => {
                        setShowTagDialog(open);
                        if (open) setSelectedVersion(version);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                            <Tag className="w-3 h-3 mr-1" />
                            Tag
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A1628] border-white/20">
                          <DialogHeader>
                            <DialogTitle className="text-white">Add Tag</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Key"
                              value={tagKey}
                              onChange={(e) => setTagKey(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Input
                              placeholder="Value"
                              value={tagValue}
                              onChange={(e) => setTagValue(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Button
                              onClick={() => addTagMutation.mutate({ version: version.version, key: tagKey, value: tagValue })}
                              disabled={!tagKey || !tagValue || addTagMutation.isPending}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              {addTagMutation.isPending ? 'Adding...' : 'Add Tag'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {version.description && (
                    <p className="text-sm text-slate-300 mb-3">{version.description}</p>
                  )}

                  {version.tags && Object.keys(version.tags).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(version.tags).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="border-white/20 text-slate-400 text-xs">
                          {key}: {value}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Transition to:</span>
                    <Select
                      value={version.current_stage}
                      onValueChange={(stage) => transitionStageMutation.mutate({ version: version.version, stage })}
                    >
                      <SelectTrigger className="w-[140px] h-8 bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A1628] border-white/20">
                        <SelectItem value="None">None</SelectItem>
                        <SelectItem value="Staging">Staging</SelectItem>
                        <SelectItem value="Production">Production</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}