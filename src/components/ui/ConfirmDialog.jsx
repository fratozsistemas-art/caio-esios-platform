import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Check } from "lucide-react";

export function ConfirmDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "danger" // danger | warning | info
}) {
  const variants = {
    danger: {
      icon: Trash2,
      iconColor: "text-red-500",
      buttonClass: "bg-red-600 hover:bg-red-700"
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
      buttonClass: "bg-yellow-600 hover:bg-yellow-700"
    },
    info: {
      icon: Check,
      iconColor: "text-blue-500",
      buttonClass: "bg-blue-600 hover:bg-blue-700"
    }
  };

  const config = variants[variant] || variants.danger;
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${config.iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <DialogTitle className="text-white text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/5"
          >
            {cancelText}
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={config.buttonClass}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}