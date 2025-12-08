import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Trash2, Search, Eye, Edit, Lock } from "lucide-react";
import { toast } from "sonner";

export default function EntityAccessManager() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntityType, setSelectedEntityType] = useState("all");
  const queryClient = useQueryClient();

  const { data: entityAccess = [] } = useQuery({
    queryKey: ['entityAccess'],
    queryFn: () => base44.entities.EntityAccess.list()
  });

  const revokeAccessMutation = useMutation({
    mutationFn: (accessId) => base44.entities.EntityAccess.delete(accessId),
    onSuccess: () => {
      queryClient.invalidateQueries(['entityAccess']);
      toast.success('Access revoked');
    }
  });

  const filteredAccess = entityAccess.filter(access => {
    const matchesSearch = access.shared_with_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         access.entity_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedEntityType === "all" || access.entity_type === selectedEntityType;
    return matchesSearch && matchesType && access.is_active;
  });

  const accessLevelColors = {
    view: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    comment: "bg-green-500/20 text-green-400 border-green-500/30",
    edit: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    admin: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const accessLevelIcons = {
    view: Eye,
    comment: Share2,
    edit: Edit,
    admin: Lock
  };

  const entityTypes = [...new Set(entityAccess.map(a => a.entity_type))];

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Entity-Level Access Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by user or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Entity Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {entityTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredAccess.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No entity access records found
              </div>
            ) : (
              filteredAccess.map((access) => {
                const Icon = accessLevelIcons[access.access_level] || Eye;
                return (
                  <Card key={access.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                              {access.entity_type}
                            </Badge>
                            <span className="text-sm text-slate-400">→</span>
                            <span className="text-white font-medium">{access.shared_with_email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>Owner: {access.owner_email}</span>
                            {access.granted_by && <span>• Granted by: {access.granted_by}</span>}
                            <span>• Created: {new Date(access.created_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={accessLevelColors[access.access_level]}>
                            <Icon className="w-3 h-3 mr-1" />
                            {access.access_level}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeAccessMutation.mutate(access.id)}
                            className="text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}