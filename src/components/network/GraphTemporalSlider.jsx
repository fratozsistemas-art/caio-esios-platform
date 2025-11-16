import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function GraphTemporalSlider({ 
  minDate, 
  maxDate, 
  currentDate, 
  onDateChange,
  onPlayPause,
  isPlaying = false 
}) {
  const [sliderValue, setSliderValue] = useState([50]);

  const minTime = new Date(minDate).getTime();
  const maxTime = new Date(maxDate).getTime();
  const currentTime = new Date(currentDate).getTime();

  const handleSliderChange = (value) => {
    setSliderValue(value);
    const percentage = value[0] / 100;
    const newTime = minTime + (maxTime - minTime) * percentage;
    onDateChange(new Date(newTime));
  };

  const jumpToStart = () => {
    setSliderValue([0]);
    onDateChange(new Date(minDate));
  };

  const jumpToEnd = () => {
    setSliderValue([100]);
    onDateChange(new Date(maxDate));
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          Temporal Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{format(new Date(minDate), 'MMM dd, yyyy')}</span>
          <span className="text-white font-medium">{format(new Date(currentDate), 'MMM dd, yyyy HH:mm')}</span>
          <span>{format(new Date(maxDate), 'MMM dd, yyyy')}</span>
        </div>

        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={100}
          step={1}
          className="w-full"
        />

        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={jumpToStart}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onPlayPause}
            className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={jumpToEnd}
            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}