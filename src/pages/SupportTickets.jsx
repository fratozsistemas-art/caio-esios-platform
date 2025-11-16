import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileText, AlertCircle, Clock, CheckCircle, User } from "lucide-react";
import { toast } from "sonner";

export default function SupportTickets() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: tickets = [] } = useQuery({
    queryKey: ['support_tickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SupportTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['support_tickets']);
      toast.success('Ticket atualizado');
    }
  });

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'hermes') return t.ticket_type.startsWith('hermes_');
    return t.status === filter;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    hermes: tickets.filter(t => t.ticket_type.startsWith('hermes_')).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Support Tickets
          </h1>
          <p className="text-slate-400 mt-1">Gerenciar tickets de suporte e remediações</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'all' ? 'bg-blue-600' : 'bg-white/5 border-white/10 text-white'}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter('hermes')}
            variant={filter === 'hermes' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'hermes' ? 'bg-cyan-600' : 'bg-white/5 border-white/10 text-white'}
          >
            Hermes
          </Button>
          <Button
            onClick={() => setFilter('open')}
            variant={filter === 'open' ? 'default' : 'outline'}
            size="sm"
            className={filter === 'open' ? 'bg-orange-600' : 'bg-white/5 border-white/10 text-white'}
          >
            Open
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Open</p>
            <p className="text-2xl font-bold text-white">{stats.open}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-white">{stats.in_progress}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Resolved</p>
            <p className="text-2xl font-bold text-white">{stats.resolved}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Hermes Tickets</p>
            <p className="text-2xl font-bold text-white">{stats.hermes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onSelect={setSelectedTicket}
              selected={selectedTicket?.id === ticket.id}
            />
          ))}
        </div>

        {selectedTicket && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 mb-2">Status</p>
                <Select
                  value={selectedTicket.status}
                  onValueChange={(value) => {
                    updateMutation.mutate({
                      id: selectedTicket.id,
                      data: { 
                        status: value,
                        ...(value === 'resolved' && { resolved_at: new Date().toISOString() })
                      }
                    });
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Assigned To</p>
                <Select
                  value={selectedTicket.assigned_team}
                  onValueChange={(value) => {
                    updateMutation.mutate({
                      id: selectedTicket.id,
                      data: { assigned_team: value }
                    });
                  }}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="data_quality">Data Quality</SelectItem>
                    <SelectItem value="ai_ops">AI Ops</SelectItem>
                    <SelectItem value="governance">Governance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Resolution Notes</p>
                <Textarea
                  placeholder="Add notes..."
                  className="bg-white/5 border-white/10 text-white h-32"
                  defaultValue={selectedTicket.resolution_notes || ''}
                  onBlur={(e) => {
                    if (e.target.value !== selectedTicket.resolution_notes) {
                      updateMutation.mutate({
                        id: selectedTicket.id,
                        data: { resolution_notes: e.target.value }
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TicketCard({ ticket, onSelect, selected }) {
  return (
    <Card
      className={`bg-white/5 border ${selected ? 'border-cyan-500' : 'border-white/10'} hover:bg-white/10 transition-all cursor-pointer`}
      onClick={() => onSelect(ticket)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`${
                ticket.priority === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {ticket.priority}
              </Badge>
              <Badge className={`${
                ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {ticket.status}
              </Badge>
            </div>
            <h3 className="text-white font-medium">{ticket.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{ticket.description?.substring(0, 100)}...</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-white/10">
          <span>{ticket.assigned_team}</span>
          <span>{new Date(ticket.created_date).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}