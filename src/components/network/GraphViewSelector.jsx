import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Network, Grid3x3, GitBranch, Share2, Layers, 
  Circle, Target, Webhook 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const viewModes = [
  { id: 'force', label: 'Force-Directed', icon: Network, description: 'Dynamic physics-based layout' },
  { id: 'hierarchical', label: 'Hierarchical', icon: GitBranch, description: 'Top-down tree structure' },
  { id: 'radial', label: 'Radial', icon: Circle, description: 'Circular layout from center' },
  { id: 'grid', label: 'Grid', icon: Grid3x3, description: 'Organized grid pattern' },
  { id: 'circular', label: 'Circular', icon: Target, description: 'Nodes arranged in circle' },
  { id: 'layered', label: 'Layered', icon: Layers, description: 'Separated by node type' }
];

export default function GraphViewSelector({ currentView, onViewChange }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
          {React.createElement(viewModes.find(v => v.id === currentView)?.icon || Network, { className: "w-4 h-4 mr-2" })}
          {viewModes.find(v => v.id === currentView)?.label || 'Force-Directed'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-900 border-slate-700">
        {viewModes.map((mode) => {
          const Icon = mode.icon;
          return (
            <DropdownMenuItem
              key={mode.id}
              onClick={() => onViewChange(mode.id)}
              className={`cursor-pointer ${currentView === mode.id ? 'bg-blue-500/20' : ''}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 text-blue-400" />
                <div>
                  <p className="text-sm font-medium text-white">{mode.label}</p>
                  <p className="text-xs text-slate-400">{mode.description}</p>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}