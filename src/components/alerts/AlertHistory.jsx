import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  History,
  AlertTriangle,
  Activity,
  Bell,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  Clock
} from "lucide-react";

export default function AlertHistory() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['all-notifications'],
    queryFn: () => base44.entities.Notification.list("-created_date", 100)
  });

  const filteredNotifications = notifications.filter(n => {
    const matchesSeverity = severityFilter === "all" || n.severity === severityFilter;
    const matchesSearch = !searchTerm || 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <Activity className="w-4 h-4 text-yellow-400" />;
      default: return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Histórico de Alertas
            <Badge className="bg-white/10 text-slate-400 ml-2">
              {filteredNotifications.length} registros
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white/5 border-white/10 text-white w-48"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-emerald-400/50 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Nenhum alerta encontrado</p>
            <p className="text-slate-500 text-sm">
              {searchTerm || severityFilter !== 'all' 
                ? 'Tente ajustar os filtros'
                : 'Histórico limpo - nenhum alerta registrado'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notif => (
              <div 
                key={notif.id}
                className={`p-4 rounded-lg border ${getSeverityStyle(notif.severity)} hover:opacity-90 transition-opacity`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/10">
                    {getSeverityIcon(notif.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium">{notif.title}</p>
                      <Badge className={
                        notif.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        notif.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }>
                        {notif.severity}
                      </Badge>
                      {notif.is_read && (
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Lido
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{notif.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.created_date).toLocaleString()}
                      </span>
                      {notif.source && (
                        <span>Fonte: {notif.source}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}