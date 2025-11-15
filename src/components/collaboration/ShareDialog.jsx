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
import { Share2, Loader2, X, Eye, MessageSquare, Edit3, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

const ACCESS_LEVELS = [
  { value: 'view', label: 'View Only', icon: Eye, description: 'Can view conversation' },
  { value: 'comment', label: 'Can Comment', icon: MessageSquare, description: 'Can view and add comments' },
  { value: 'edit', label: 'Can Edit', icon: Edit3, description: 'Can view, comment, and edit' }
];

export default function ShareDialog({ conversationId, existingShares = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");
  const [message, setMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shares, setShares] = useState(existingShares);

  const handleShare = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSharing(true);
    try {
      const response = await base44.functions.invoke('shareConversation', {
        conversation_id: conversationId,
        shared_with_email: email.trim(),
        access_level: accessLevel,
        message: message.trim() || null
      });

      if (response.data?.success) {
        toast.success(`Shared with ${email}`);
        setShares([...shares, {
          email: email.trim(),
          access_level: accessLevel,
          shared_at: new Date().toISOString()
        }]);
        setEmail("");
        setMessage("");
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error(error.response?.data?.error || 'Failed to share');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 text-white hover:bg-white/10"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
          {shares.length > 0 && (
            <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
              {shares.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            Share Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              User Email
            </label>
            <Input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Access Level */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Access Level
            </label>
            <Select value={accessLevel} onValueChange={setAccessLevel}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_LEVELS.map(level => {
                  const Icon = level.icon;
                  return (
                    <SelectItem key={level.value} value={level.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-slate-400">{level.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Optional Message */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block">
              Message (optional)
            </label>
            <Textarea
              placeholder="Add a note about why you're sharing..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
            />
          </div>

          {/* Share Button */}
          <Button
            onClick={handleShare}
            disabled={isSharing || !email.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSharing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Share Conversation
              </>
            )}
          </Button>

          {/* Existing Shares */}
          {shares.length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-sm text-slate-300 mb-3">Shared with</h4>
              <div className="space-y-2">
                {shares.map((share, idx) => {
                  const level = ACCESS_LEVELS.find(l => l.value === share.access_level);
                  const Icon = level?.icon || Eye;
                  
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {share.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm text-white">{share.email}</div>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Icon className="w-3 h-3" />
                            <span>{level?.label}</span>
                          </div>
                        </div>
                      </div>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}