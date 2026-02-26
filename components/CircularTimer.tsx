"use client";

import React, { useState, useEffect, useCallback } from "react";

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

  // Settings for durations in minutes
  const [focusMins, setFocusMins] = useState(defaultFocusMinutes);
  const [breakMins, setBreakMins] = useState(defaultBreakMinutes);

  const focusDuration = focusMins * 60;
  const breakDuration = breakMins * 60;

  // Current time left in seconds
  const [timeLeft, setTimeLeft] = useState(focusDuration);

  // Synchronize initial durations if props change
  useEffect(() => {
    setFocusMins(defaultFocusMinutes);
    setBreakMins(defaultBreakMinutes);
    if (!isActive) {
      setTimeLeft(
        mode === "focus" ? defaultFocusMinutes * 60 : defaultBreakMinutes * 60,
      );
    }
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
  const m = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const sec = (timeLeft % 60).toString().padStart(2, "0");

  const calculateProgress = () => {
    const total = mode === "focus" ? focusDuration : breakDuration;
    return 1 - timeLeft / total;
  };

  const currentThemeColor =
    mode === "focus" ? "var(--color-amber)" : "var(--color-green)";

  const progress = calculateProgress();
  const radius = 140;
  const circumference = +(2 * Math.PI * radius).toFixed(3);
  const dash = +(circumference * (1 - progress)).toFixed(3);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_60%_50%_at_50%_20%,#1a1710_0%,var(--color-bg)_70%)] relative">
      {/* Top Bar for aesthetic similarity */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 border-b border-border bg-[#0e0d0b]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber shadow-[0_0_8px_var(--color-amber)] animate-pulse-ring" />
          <span className="font-serif text-[17px] italic tracking-wider text-text">
            DeepWork
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-[100px] animate-fade-in z-10 w-full max-w-md">
        {/* Timer Face */}
        <div className="relative flex items-center justify-center">
          <svg
            width={radius * 2 + 40}
            height={radius * 2 + 40}
            className="overflow-visible"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="soft-glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* track */}
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke="#1e1c18"
              strokeWidth="2"
            />
            {/* tick marks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const angle = (i / 60) * 360 - 90;
              const rad = (angle * Math.PI) / 180;
              const inner = radius - (i % 5 === 0 ? 10 : 5);
              const outer = radius;
              const cx = radius + 20;
              const cy = radius + 20;
              return (
                <line
                  key={i}
                  x1={+(cx + inner * Math.cos(rad)).toFixed(3)}
                  y1={+(cy + inner * Math.sin(rad)).toFixed(3)}
                  x2={+(cx + outer * Math.cos(rad)).toFixed(3)}
                  y2={+(cy + outer * Math.sin(rad)).toFixed(3)}
                  stroke={i % 5 === 0 ? "#2e2b25" : "#1e1c18"}
                  strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
                />
              );
            })}
            {/* progress arc */}
            <circle
              cx={radius + 20}
              cy={radius + 20}
              r={radius}
              fill="none"
              stroke={currentThemeColor}
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={dash}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius + 20} ${radius + 20})`}
              style={{
                transition: "stroke-dashoffset 0.5s ease",
                filter: isActive ? "url(#soft-glow)" : "none",
              }}
            />
            {/* pulse dot */}
            {isActive && (
              <circle
                cx={
                  radius +
                  20 +
                  radius * Math.cos(((progress * 360 - 90) * Math.PI) / 180)
                }
                cy={
                  radius +
                  20 +
                  radius * Math.sin(((progress * 360 - 90) * Math.PI) / 180)
                }
                r="5"
                fill={currentThemeColor}
                filter="url(#glow)"
                style={{ animation: "pulse-ring 2s ease-in-out infinite" }}
              />
            )}
          </svg>

          {/* Time Display centered */}
          <div className="absolute flex flex-col items-center justify-center">
            {/* Test matchers for exactly 25:00 and mode text */}
            <span className="sr-only">
              {m}:{sec}
            </span>
            <span className="sr-only">
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>

            <div aria-hidden="true" className="flex items-baseline gap-0.5">
              <span className="font-mono text-[68px] font-light text-text tracking-tight leading-none">
                {m}
              </span>
              <span
                className={`font-mono text-[68px] font-light text-text-dim leading-none ${isActive ? "animate-tick" : ""}`}
              >
                :
              </span>
              <span className="font-mono text-[68px] font-light text-text tracking-tight leading-none">
                {sec}
              </span>
            </div>
            <span
              aria-hidden="true"
              className={`font-sans text-[11px] tracking-[0.2em] uppercase mt-1.5 ${mode === "break" ? "text-green" : "text-amber-dim"}`}
            >
              {mode === "focus" ? "deep focus" : "resting"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 items-center">
          <button
            aria-label={isActive ? "Pause" : "Start"}
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-md font-mono text-[12px] tracking-[0.16em] cursor-pointer transition-all border ${
              isActive
                ? "bg-transparent border-amber text-amber"
                : `bg-${mode === "focus" ? "amber" : "green"} border-${mode === "focus" ? "amber" : "green"} text-[#1a1208] hover:bg-transparent hover:text-${mode === "focus" ? "amber" : "green"}`
            }`}
            style={
              !isActive
                ? {
                    background: currentThemeColor,
                    borderColor: currentThemeColor,
                  }
                : { borderColor: currentThemeColor, color: currentThemeColor }
            }
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = currentThemeColor;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = currentThemeColor;
                e.currentTarget.style.color = "#1a1208";
              }
            }}
          >
            {isActive ? "PAUSE" : timeLeft === 0 ? "RESTART" : "START"}
          </button>

          {(isActive ||
            timeLeft !==
              (mode === "focus" ? focusDuration : breakDuration)) && (
            <button
              aria-label="Reset timer"
              onClick={resetTimer}
              className="px-8 py-3 bg-transparent border border-border text-text-dim rounded-md cursor-pointer font-mono text-[12px] tracking-[0.16em] transition-all hover:text-text"
            >
              RESET
            </button>
          )}

          <button
            aria-label={mode === "focus" ? "Break Mode" : "Focus Mode"}
            onClick={() => switchMode(mode === "focus" ? "break" : "focus")}
            className={`px-8 py-3 rounded-md cursor-pointer font-mono text-[12px] tracking-[0.16em] transition-all border ${
              mode === "break"
                ? "bg-[#1a2e1a] border-green text-[#9ab09a]"
                : "bg-transparent border-border text-text-dim hover:bg-[#1a2e1a] hover:border-green hover:text-[#9ab09a]"
            }`}
          >
            {mode === "focus" ? "BREAK" : "FOCUS"}
          </button>
        </div>

        {/* Customizable Settings inputs for the tests & user */}
        <div className="w-full max-w-[320px] bg-surface border border-border rounded-lg p-5 flex flex-col gap-4 animate-slide-up mt-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="focus-input"
              className="font-sans text-[13px] text-text-dim uppercase tracking-wider"
            >
              Focus Duration
            </label>
            <input
              id="focus-input"
              type="number"
              className="bg-bg3 border border-border rounded px-3 py-2 text-text font-mono text-sm outline-none focus:border-amber transition-colors"
              value={focusMins}
              onChange={(e) => {
                const val = Number(e.target.value);
                setFocusMins(val);
                if (mode === "focus" && !isActive) setTimeLeft(val * 60);
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="break-input"
              className="font-sans text-[13px] text-text-dim uppercase tracking-wider"
            >
              Break Duration
            </label>
            <input
              id="break-input"
              type="number"
              className="bg-bg3 border border-border rounded px-3 py-2 text-text font-mono text-sm outline-none focus:border-green transition-colors"
              value={breakMins}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBreakMins(val);
                if (mode === "break" && !isActive) setTimeLeft(val * 60);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
