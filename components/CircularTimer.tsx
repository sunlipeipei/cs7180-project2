import React, { useState, useEffect, useCallback } from "react";
import { Play, Pause, RefreshCw, Coffee, Briefcase } from "lucide-react";

type Mode = "focus" | "break";

interface CircularTimerProps {
  defaultFocusMinutes?: number;
  defaultBreakMinutes?: number;
  onComplete?: (mode: Mode) => void;
}

export default function CircularTimer({
  defaultFocusMinutes = 25,
  defaultBreakMinutes = 5,
  onComplete,
}: CircularTimerProps) {
  const [mode, setMode] = useState<Mode>("focus");
  const [isActive, setIsActive] = useState(false);

  // Settings for durations
  const focusDuration = defaultFocusMinutes * 60;
  const breakDuration = defaultBreakMinutes * 60;

  // Current time left in seconds
  const [timeLeft, setTimeLeft] = useState(focusDuration);

  // Synchronize initial durations if props change
  useEffect(() => {
    // Only reset time left if we aren't active
    setTimeLeft((prev) => prev); // dummy to avoid unused
    setTimeLeft(mode === "focus" ? focusDuration : breakDuration);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFocusMinutes, defaultBreakMinutes]);

  const toggleTimer = () => setIsActive((prev) => !prev);

  const switchMode = (newMode: Mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === "focus" ? focusDuration : breakDuration);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === "focus" ? focusDuration : breakDuration);
  };

  const handleComplete = useCallback(() => {
    setIsActive(false);
    // Visual gentle notification or external callback
    if (onComplete) {
      onComplete(mode);
    } else {
      console.log(`Session Complete: ${mode}`);
    }
  }, [mode, onComplete]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            clearInterval(interval!);
            handleComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleComplete]);

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const calculateProgress = () => {
    const total = mode === "focus" ? focusDuration : breakDuration;
    return ((total - timeLeft) / total) * 100;
  };

  // SVG parameters
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (calculateProgress() / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-3xl shadow-2xl max-w-md mx-auto relative overflow-hidden">
      {/* Dynamic background glow based on mode */}
      <div
        className={`absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none transition-colors duration-1000 ${mode === "focus" ? "bg-indigo-500" : "bg-emerald-500"}`}
      />

      {/* Mode Switcher */}
      <div className="flex bg-zinc-800 rounded-full p-1 mb-10 z-10 w-full justify-between">
        <button
          onClick={() => switchMode("focus")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all ${
            mode === "focus"
              ? "bg-indigo-500 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
          aria-label="Focus Mode"
        >
          <Briefcase size={16} /> Focus
        </button>
        <button
          onClick={() => switchMode("break")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-sm font-medium transition-all ${
            mode === "break"
              ? "bg-emerald-500 text-white shadow-md"
              : "text-zinc-400 hover:text-white"
          }`}
          aria-label="Break Mode"
        >
          <Coffee size={16} /> Break
        </button>
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center mb-10 z-10">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={mode === "focus" ? "#6366f1" : "#10b981"}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 1s linear",
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-light text-white tracking-tight font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-zinc-400 mt-2 capitalize tracking-widest uppercase">
            {mode}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 z-10">
        <button
          onClick={toggleTimer}
          className={`w-16 h-16 flex items-center justify-center rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 ${
            isActive
              ? "bg-zinc-800 text-red-400 hover:bg-zinc-700"
              : `text-white ${mode === "focus" ? "bg-indigo-500 hover:bg-indigo-600" : "bg-emerald-500 hover:bg-emerald-600"}`
          }`}
          aria-label={isActive ? "Pause" : "Start"}
        >
          {isActive ? (
            <Pause size={28} fill="currentColor" />
          ) : (
            <Play size={28} fill="currentColor" className="ml-1" />
          )}
        </button>

        <button
          onClick={resetTimer}
          className="w-16 h-16 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all shadow-lg hover:scale-105 active:scale-95"
          aria-label="Reset Timer"
          title="Reset"
        >
          <RefreshCw size={24} />
        </button>
      </div>

      {/* End Session Notification Placeholder */}
      {timeLeft === 0 && !isActive && (
        <div className="absolute bottom-4 bg-zinc-800 border border-zinc-700 text-white px-4 py-2 rounded-lg text-sm shadow-xl slide-up-anim z-20 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Session ready to log.
        </div>
      )}
    </div>
  );
}
