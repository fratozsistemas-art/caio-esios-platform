import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, AlertTriangle, TrendingUp, Network, Search, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackReviewPanel({ feedback, selectedFeedback, onSelectFeedback, stats }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');

  const filteredFeedback = feedback.filter(f => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'helpful' && f.was_helpful) ||
      (filter === 'false_positive' && f.false_positive) ||
      (filter === 'high_rated' && (f.accuracy_rating >= 4 || f.usefulness_rating >= 4)) ||
      (filter === 'low_rated' && (f.accuracy_rating <= 2 || f.usefulness_rating <= 2));
    
    const matchesSearch = 
      search === '' ||
      f.comment?.toLowerCase().includes(search.toLowerCase()) ||
      f.insight_type.includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === 'accuracy') return (b.accuracy_rating || 0) - (a.accuracy_rating || 0);
    if (sortBy === 'usefulness') return (b.usefulness_rating || 0) - (a.usefulness_rating || 0);
    return 0;
  });

  const handleSelectAll = () => {
    if (selectedFeedback.length === filteredFeedback.length) {
      onSelectFeedback([]);
    } else {
      onSelectFeedback(filteredFeedback.map(f => f.id));
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedFeedback.includes(id)) {
      onSelectFeedback(selectedFeedback.filter(fid => fid !== id));
    } else {
      onSelectFeedback([...selectedFeedback, id]);
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'prediction': return TrendingUp;
      case 'influencer': return Network;
      default: return Star;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search feedback..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Feedback</SelectItem>
                <SelectItem value="helpful">Helpful</SelectItem>
                <SelectItem value="false_positive">False Positives</SelectItem>
                <SelectItem value="high_rated">High Rated (4-5★)</SelectItem>
                <SelectItem value="low_rated">Low Rated (1-2★)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">By Date</SelectItem>
                <SelectItem value="accuracy">By Accuracy</SelectItem>
                <SelectItem value="usefulness">By Usefulness</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={handleSelectAll}
              className="border-white/10 text-white hover:bg-white/10"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedFeedback.length === filteredFeedback.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {selectedFeedback.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-400">
                {selectedFeedback.length} selected
              </Badge>
              <span className="text-xs text-slate-400">
                Switch to Datasets tab to create training dataset
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-3">
        {filteredFeedback.map((item, idx) => {
          const Icon = getInsightIcon(item.insight_type);
          const isSelected = selectedFeedback.includes(item.id);

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className={`bg-white/5 border-white/10 hover:bg-white/10 transition-colors ${isSelected ? 'ring-2 ring-purple-500' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(item.id)}
                      className="mt-1"
                    />

                    <Icon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <Badge className="bg-blue-500/20 text-blue-400 mb-1">
                            {item.insight_type}
                          </Badge>
                          {item.false_positive && (
                            <Badge className="bg-red-500/20 text-red-400 ml-2">
                              False Positive
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {new Date(item.created_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-2">
                        {item.accuracy_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Accuracy:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < item.accuracy_rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {item.usefulness_rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">Usefulness:</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < item.usefulness_rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {item.comment && (
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {item.comment}
                        </p>
                      )}

                      <p className="text-xs text-slate-500 mt-1">
                        By {item.user_email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredFeedback.length === 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">No feedback matches your filters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}