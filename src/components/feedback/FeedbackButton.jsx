import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import FeedbackWidget from './FeedbackWidget';

export default function FeedbackButton({ 
  type = 'general_feedback',
  targetComponent,
  targetId,
  variant = 'ghost',
  size = 'sm',
  className = ''
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
        >
          <MessageSquare className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-[#0A2540] to-[#0A1628] border-[#00D4FF]/30 max-w-md">
        <FeedbackWidget
          type={type}
          targetComponent={targetComponent}
          targetId={targetId}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}