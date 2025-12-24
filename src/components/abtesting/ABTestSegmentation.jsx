import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, X, Target } from 'lucide-react';

export default function ABTestSegmentation({ value = {}, onChange }) {
  const [criteria, setCriteria] = useState(value || {
    percentage: 100,
    user_roles: [],
    user_segments: []
  });

  const updateCriteria = (updates) => {
    const newCriteria = { ...criteria, ...updates };
    setCriteria(newCriteria);
    onChange?.(newCriteria);
  };

  const addRole = (role) => {
    if (!criteria.user_roles.includes(role)) {
      updateCriteria({ 
        user_roles: [...(criteria.user_roles || []), role] 
      });
    }
  };

  const removeRole = (role) => {
    updateCriteria({ 
      user_roles: (criteria.user_roles || []).filter(r => r !== role) 
    });
  };

  const addSegment = (segment) => {
    if (!criteria.user_segments?.includes(segment)) {
      updateCriteria({ 
        user_segments: [...(criteria.user_segments || []), segment] 
      });
    }
  };

  const removeSegment = (segment) => {
    updateCriteria({ 
      user_segments: (criteria.user_segments || []).filter(s => s !== segment) 
    });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Audience Targeting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traffic Percentage */}
        <div>
          <Label className="text-white mb-2 block">Traffic Percentage</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="0"
              max="100"
              value={criteria.percentage}
              onChange={(e) => updateCriteria({ percentage: parseInt(e.target.value) || 0 })}
              className="bg-slate-800 border-slate-700 text-white"
            />
            <span className="text-slate-400 text-sm">
              {criteria.percentage}% of eligible users
            </span>
          </div>
        </div>

        {/* User Roles */}
        <div>
          <Label className="text-white mb-2 block">User Roles (optional)</Label>
          <div className="space-y-2">
            <Select onValueChange={addRole}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Add role filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            
            {criteria.user_roles && criteria.user_roles.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {criteria.user_roles.map(role => (
                  <Badge key={role} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {role}
                    <button onClick={() => removeRole(role)} className="ml-2 hover:text-blue-300">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User Segments */}
        <div>
          <Label className="text-white mb-2 block">Custom Segments (optional)</Label>
          <div className="space-y-2">
            <Select onValueChange={addSegment}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Add segment..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new_users">New Users (< 7 days)</SelectItem>
                <SelectItem value="active_users">Active Users (7-30 days)</SelectItem>
                <SelectItem value="power_users">Power Users (> 30 days)</SelectItem>
                <SelectItem value="mobile">Mobile Users</SelectItem>
                <SelectItem value="desktop">Desktop Users</SelectItem>
              </SelectContent>
            </Select>
            
            {criteria.user_segments && criteria.user_segments.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {criteria.user_segments.map(segment => (
                  <Badge key={segment} className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {segment.replace('_', ' ')}
                    <button onClick={() => removeSegment(segment)} className="ml-2 hover:text-purple-300">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">Target Audience</span>
          </div>
          <p className="text-xs text-slate-400">
            {criteria.percentage}% of users
            {criteria.user_roles && criteria.user_roles.length > 0 && 
              ` with roles: ${criteria.user_roles.join(', ')}`
            }
            {criteria.user_segments && criteria.user_segments.length > 0 && 
              ` in segments: ${criteria.user_segments.join(', ')}`
            }
            {criteria.percentage === 100 && (!criteria.user_roles || criteria.user_roles.length === 0) && (!criteria.user_segments || criteria.user_segments.length === 0) && 
              ' (all users)'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
}