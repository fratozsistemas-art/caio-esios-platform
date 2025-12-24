import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageSquare } from 'lucide-react';
import FeedbackWidget from './FeedbackWidget';

export default function FeedbackButton({ 
  type = 'general_feedback',
  targetComponent,
  targetId,
  variant = 'outline',
  size = 'sm',
  className = '',
  label = 'Feedback'
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={`border-[#00D4FF]/40 text-[#00D4FF] hover:bg-[#00D4FF]/20 ${className}`}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Share Your Feedback</DialogTitle>
          </DialogHeader>
          <FeedbackWidget
            type={type}
            targetComponent={targetComponent}
            targetId={targetId}
            onClose={() => setOpen(false)}
            inline
          />
        </DialogContent>
      </Dialog>
    </>
  );
}