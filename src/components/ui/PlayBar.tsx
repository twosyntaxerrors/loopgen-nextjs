import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download, ChevronDown } from 'lucide-react';
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

interface PlayBarProps {
  audioUrl: string;
  onDownload: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
}

const PlayBar: React.FC<PlayBarProps> = ({ audioUrl, onDownload, isPlaying, onPlayPause, onClose }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number>();

  const updateTime = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(updateTime);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('ended', () => {
        onPlayPause();
        setCurrentTime(0);
      });

      return () => {
        audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.removeEventListener('ended', onPlayPause);
      };
    }
  }, [onPlayPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.play();
        animationRef.current = requestAnimationFrame(updateTime);
      } else {
        audio.pause();
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const handleSeek = (newValue: number[]) => {
    const [value] = newValue;
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (newValue: number[]) => {
    const [value] = newValue;
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value;
    }
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const seek = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(audioRef.current.currentTime + amount, duration));
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-2 shadow-lg">
      <audio ref={audioRef} src={audioUrl} />
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={() => seek(-5)}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onPlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => seek(5)}>
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Slider 
            min={0} 
            max={1} 
            step={0.01}
            value={[isMuted ? 0 : volume]} 
            onValueChange={handleVolumeChange}
            className="w-20"
          />
          <Button variant="ghost" size="sm" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-xs">{formatTime(currentTime)}</span>
        <Slider 
          min={0} 
          max={duration} 
          step={0.1}
          value={[currentTime]} 
          onValueChange={handleSeek}
          className="w-full"
        />
        <span className="text-xs">{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default PlayBar;