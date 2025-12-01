import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckSquare, Activity, Users } from 'lucide-react';
import UserPresenceIndicator from './UserPresenceIndicator';
import CommentThread from './CommentThread';
import TaskAssignmentPanel from './TaskAssignmentPanel';
import ActivityFeedPanel from './ActivityFeedPanel';

export default function CollaborationSidebar({ entityType, entityId, entityTitle }) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/10 gap-2"
        >
          <Users className="w-4 h-4" />
          Collaborate
          <UserPresenceIndicator entityType={entityType} entityId={entityId} compact />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-slate-900 border-slate-700 w-[450px] sm:max-w-[450px]">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center justify-between">
            <span>Collaboration</span>
            <UserPresenceIndicator entityType={entityType} entityId={entityId} />
          </SheetTitle>
          {entityTitle && (
            <p className="text-sm text-slate-400 truncate">{entityTitle}</p>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 bg-slate-800">
            <TabsTrigger value="comments" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <MessageSquare className="w-4 h-4 mr-1" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <CheckSquare className="w-4 h-4 mr-1" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#00D4FF]/20 data-[state=active]:text-[#00D4FF]">
              <Activity className="w-4 h-4 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-4">
            <CommentThread entityType={entityType} entityId={entityId} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <TaskAssignmentPanel entityType={entityType} entityId={entityId} />
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityFeedPanel entityType={entityType} entityId={entityId} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}