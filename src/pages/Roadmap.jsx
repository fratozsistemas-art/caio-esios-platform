import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowUp, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles,
  Filter,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const statusConfig = {
  planned: { label: "Planned", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: TrendingUp },
  completed: { label: "Completed", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2 },
  under_review: { label: "Under Review", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: AlertCircle }
};

const categoryConfig = {
  feature: { label: "Feature", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
  improvement: { label: "Improvement", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  bug_fix: { label: "Bug Fix", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  integration: { label: "Integration", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" }
};

export default function Roadmap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [user, setUser] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["roadmapItems"],
    queryFn: () => base44.entities.RoadmapItem.list("-votes")
  });

  const voteMutation = useMutation({
    mutationFn: async (item) => {
      const hasVoted = item.voted_by?.includes(user.email);
      const newVotes = hasVoted ? item.votes - 1 : item.votes + 1;
      const newVotedBy = hasVoted 
        ? item.voted_by.filter(email => email !== user.email)
        : [...(item.voted_by || []), user.email];

      await base44.entities.RoadmapItem.update(item.id, {
        votes: newVotes,
        voted_by: newVotedBy
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["roadmapItems"]);
    }
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const groupedItems = {
    completed: filteredItems.filter(item => item.status === "completed"),
    in_progress: filteredItems.filter(item => item.status === "in_progress"),
    under_review: filteredItems.filter(item => item.status === "under_review"),
    planned: filteredItems.filter(item => item.status === "planned")
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Product Roadmap</h1>
        <p className="text-slate-400">Vote on features and track development progress</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features..."
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-48 bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="improvement">Improvement</SelectItem>
            <SelectItem value="bug_fix">Bug Fix</SelectItem>
            <SelectItem value="integration">Integration</SelectItem>
          </SelectContent>
        </Select>

        <CreateFeatureDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSuccess={() => queryClient.invalidateQueries(["roadmapItems"])}
        />
      </div>

      <div className="space-y-8">
        {Object.entries(groupedItems).map(([status, statusItems]) => {
          if (statusItems.length === 0) return null;
          const config = statusConfig[status];
          const Icon = config.icon;

          return (
            <div key={status}>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-semibold text-white">{config.label}</h2>
                <Badge variant="outline" className="text-slate-400 border-slate-600">
                  {statusItems.length}
                </Badge>
              </div>

              <div className="grid gap-4">
                {statusItems.map((item, idx) => (
                  <RoadmapCard
                    key={item.id}
                    item={item}
                    user={user}
                    onVote={() => voteMutation.mutate(item)}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No features found</h3>
            <p className="text-slate-400">Try adjusting your filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RoadmapCard({ item, user, onVote, index }) {
  const statusConf = statusConfig[item.status];
  const categoryConf = categoryConfig[item.category];
  const hasVoted = user && item.voted_by?.includes(user.email);
  const StatusIcon = statusConf.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onVote}
                disabled={!user}
                className={`border-white/10 hover:bg-white/10 ${
                  hasVoted ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-white/5'
                }`}
              >
                <ArrowUp className={`w-4 h-4 ${hasVoted ? 'text-cyan-400' : 'text-slate-400'}`} />
              </Button>
              <span className="text-sm font-semibold text-white">{item.votes}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
                <StatusIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge className={categoryConf.color}>
                  {categoryConf.label}
                </Badge>
                <Badge className={statusConf.color}>
                  {statusConf.label}
                </Badge>
                {item.estimated_release && (
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {item.estimated_release}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CreateFeatureDialog({ open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "feature",
    status: "planned"
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.RoadmapItem.create(data),
    onSuccess: () => {
      toast.success("Feature created!");
      onSuccess();
      onOpenChange(false);
      setFormData({ title: "", description: "", category: "feature", status: "planned" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-600 hover:to-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          Suggest Feature
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Suggest a Feature</DialogTitle>
          <DialogDescription className="text-slate-400">
            Help us improve by suggesting new features or improvements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-300 mb-2 block">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Feature title..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the feature..."
              className="bg-white/5 border-white/10 text-white"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">Category</label>
            <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="bug_fix">Bug Fix</SelectItem>
                <SelectItem value="integration">Integration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={!formData.title || createMutation.isPending}
            className="w-full bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-600 hover:to-yellow-600"
          >
            {createMutation.isPending ? "Creating..." : "Submit Feature"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}