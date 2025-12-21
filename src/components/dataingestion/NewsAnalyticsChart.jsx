import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Newspaper, Calendar } from "lucide-react";

const COLORS = ['#00D4FF', '#FFB800', '#10B981', '#F59E0B', '#EF4444'];

export default function NewsAnalyticsChart({ articles }) {
  const analytics = useMemo(() => {
    if (!articles || articles.length === 0) return null;

    // Source distribution
    const sourceCount = articles.reduce((acc, article) => {
      acc[article.source] = (acc[article.source] || 0) + 1;
      return acc;
    }, {});

    const sourceData = Object.entries(sourceCount)
      .map(([source, count]) => ({ name: source, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Timeline distribution
    const timelineCount = articles.reduce((acc, article) => {
      const date = new Date(article.publishedAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const timelineData = Object.entries(timelineCount)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return { sourceData, timelineData };
  }, [articles]);

  if (!analytics) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400">No articles to analyze</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Source Distribution */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-blue-400" />
            Top News Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.sourceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.sourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Timeline Distribution */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            Publishing Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 10 }} />
              <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0F1A', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card className="bg-white/5 border-white/10 md:col-span-2">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-1">Total Articles</p>
              <p className="text-2xl font-bold text-white">{articles.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Unique Sources</p>
              <p className="text-2xl font-bold text-white">{analytics.sourceData.length}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Date Range</p>
              <p className="text-sm font-semibold text-white">{analytics.timelineData.length} days</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avg per Day</p>
              <p className="text-2xl font-bold text-white">
                {(articles.length / Math.max(analytics.timelineData.length, 1)).toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}