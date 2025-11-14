import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function PatternEvolutionChart({ profile, engagements }) {
  // Generate evolution data points
  const evolutionData = engagements
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
    .map((engagement, idx) => {
      const date = new Date(engagement.created_date);
      return {
        engagement: `E${idx + 1}`,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        confidence: engagement.confirmation_rate || 50,
        fullDate: date
      };
    });

  // Add current state
  if (profile.overall_confidence) {
    evolutionData.push({
      engagement: `E${engagements.length + 1}`,
      date: 'Current',
      confidence: profile.overall_confidence,
      fullDate: new Date()
    });
  }

  // Status thresholds
  const statusThresholds = [
    { status: 'HYPOTHESIS', min: 0, max: 59, color: '#9ca3af' },
    { status: 'EMERGING', min: 60, max: 79, color: '#eab308' },
    { status: 'VALIDATED', min: 80, max: 94, color: '#22c55e' },
    { status: 'MATURE', min: 95, max: 100, color: '#3b82f6' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const status = statusThresholds.find(s => data.confidence >= s.min && data.confidence <= s.max);
      
      return (
        <div className="bg-slate-900 border border-white/20 p-3 rounded-lg shadow-lg">
          <p className="text-white font-semibold">{data.engagement}</p>
          <p className="text-sm text-slate-400">{data.date}</p>
          <p className="text-lg font-bold" style={{ color: status?.color }}>
            {data.confidence}% confidence
          </p>
          {status && (
            <p className="text-xs text-slate-400 mt-1">{status.status}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Pattern Evolution: {profile.client_name}
        </CardTitle>
        <p className="text-sm text-slate-400">
          Confidence trajectory across {engagements.length} engagements
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={evolutionData}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis 
              dataKey="engagement" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 100]}
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              label={{ value: 'Confidence %', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Status threshold lines */}
            <Line 
              type="monotone" 
              dataKey={() => 60} 
              stroke="#eab308" 
              strokeDasharray="3 3" 
              strokeWidth={1}
              dot={false}
              name="EMERGING"
            />
            <Line 
              type="monotone" 
              dataKey={() => 80} 
              stroke="#22c55e" 
              strokeDasharray="3 3" 
              strokeWidth={1}
              dot={false}
              name="VALIDATED"
            />
            <Line 
              type="monotone" 
              dataKey={() => 95} 
              stroke="#3b82f6" 
              strokeDasharray="3 3" 
              strokeWidth={1}
              dot={false}
              name="MATURE"
            />
            
            {/* Main confidence line */}
            <Area
              type="monotone"
              dataKey="confidence"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#confidenceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Status legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          {statusThresholds.map((threshold) => (
            <div key={threshold.status} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: threshold.color }}
              />
              <span className="text-xs text-slate-400">
                {threshold.status} ({threshold.min}-{threshold.max}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}