import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipBack, SkipForward, Calendar, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';

export default function GraphTemporalSlider({ 
  minDate, 
  maxDate, 
  currentDate, 
  onDateChange,
  onPlayPause,
  isPlaying = false,
  playbackSpeed = 1,
  onPlaybackSpeedChange
}) {
  const [sliderValue, setSliderValue] = useState([50]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeInput, setTimeInput] = useState('12:00');

  const minTime = new Date(minDate).getTime();
  const maxTime = new Date(maxDate).getTime();
  const currentTime = new Date(currentDate).getTime();

  useEffect(() => {
    const percentage = ((currentTime - minTime) / (maxTime - minTime)) * 100;
    setSliderValue([Math.max(0, Math.min(100, percentage))]);
  }, [currentDate, minTime, maxTime]);

  const handleSliderChange = (value) => {
    setSliderValue(value);
    const percentage = value[0] / 100;
    const newTime = minTime + (maxTime - minTime) * percentage;
    onDateChange(new Date(newTime));
  };

  const handleDateSelect = (date) => {
    if (date) {
      const [hours, minutes] = timeInput.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      onDateChange(date);
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (e) => {
    const newTime = e.target.value;
    setTimeInput(newTime);
    const [hours, minutes] = newTime.split(':').map(Number);
    const newDate = new Date(currentDate);
    newDate.setHours(hours, minutes, 0, 0);
    onDateChange(newDate);
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
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto py-1 px-2 text-white font-medium hover:bg-white/10 text-sm"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {format(new Date(currentDate), 'MMM dd, yyyy HH:mm')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10" align="center">
              <div className="p-3 space-y-3">
                <CalendarPicker
                  mode="single"
                  selected={new Date(currentDate)}
                  onSelect={handleDateSelect}
                  initialFocus
                  disabled={(date) => date < new Date(minDate) || date > new Date(maxDate)}
                  className="rounded-md border-white/10"
                />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <Input
                    type="time"
                    value={timeInput}
                    onChange={handleTimeChange}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <span>{format(new Date(maxDate), 'MMM dd, yyyy')}</span>
        </div>

        <Slider
          value={sliderValue}
          onValueChange={handleSliderChange}
          max={100}
          step={0.1}
          className="w-full"
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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

          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-slate-400" />
            <Select value={playbackSpeed?.toString() || '1'} onValueChange={(val) => onPlaybackSpeedChange?.(parseFloat(val))}>
              <SelectTrigger className="h-7 w-20 bg-white/5 border-white/10 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25x</SelectItem>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="5">5x</SelectItem>
                <SelectItem value="10">10x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}