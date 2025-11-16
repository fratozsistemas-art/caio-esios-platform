import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, TrendingUp, TrendingDown, AlertCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function VersionHistory({ workspaceId, onRestoreVersion }) {
  const { data: versions, isLoading } = useQuery({
    queryKey: ['workspace_versions', workspaceId],
    queryFn: async () => {
      const { data } = await base44.functions.invoke('getWorkspaceVersions', {
        workspace_id: workspaceId
      });
      return data.versions;
    },
    enabled: !!workspaceId
  });

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">Loading version history...</p>
        </CardContent>
      </Card>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-6 text-center">
          <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400">No version history yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-blue-400" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {versions.map((version, idx) => (
            <div
              key={idx}
              className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      v{version.version_number}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {format(new Date(version.created_at), 'MMM dd, yyyy HH:mm')}
                    </span>
                    <span className="text-xs text-slate-500">by {version.created_by}</span>
                  </div>
                  {version.comment && (
                    <p className="text-sm text-white mb-2">{version.comment}</p>
                  )}
                  {version.diff && (
                    <div className="flex gap-2 flex-wrap">
                      {version.diff.progress_changed && (
                        <Badge variant="outline" className="border-white/20 text-slate-400 text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Progress updated
                        </Badge>
                      )}
                      {version.diff.phase_changed && (
                        <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                          Phase changed
                        </Badge>
                      )}
                      {version.diff.deliverables_added > 0 && (
                        <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                          <FileText className="w-3 h-3 mr-1" />
                          +{version.diff.deliverables_added} deliverables
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {idx !== 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRestoreVersion?.(version)}
                    className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    Restore
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}