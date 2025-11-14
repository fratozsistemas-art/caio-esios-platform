import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  className = '' 
}) {
  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-12 text-center">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-slate-600" />
          </div>
        )}
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}
        {action && actionLabel && (
          <Button
            onClick={action}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/5"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default EmptyState;