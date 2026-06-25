"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  Volume2,
  VolumeX,
  Timer,
} from "lucide-react";
import { Select } from "@/components/ui/select";
import { useTest } from "@/components/test-context";
import { asset, formatTime, PLAYBACK_SPEEDS } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AudioPlayer({ src }: { src: string }) {
  const { started, countdown } = useTest();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [ready, setReady] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Wire up media events.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrent(audio.currentTime);
    const onMeta = () => {
      setDuration(audio.duration || 0);
      setReady(true);
    };
    const onEnd = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(Math.max(0, audio.currentTime + delta), audio.duration || 0);
  }, []);

  const seekTo = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setCurrent(value);
  }, []);

  const onVolume = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    audio.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !muted;
    audio.muted = next;
    setMuted(next);
  }, [muted]);

  const onSpeed = useCallback((value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = value;
    setSpeed(value);
  }, []);

  // Keyboard: space toggles play when not typing in a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowLeft" && e.shiftKey) {
        seekBy(-10);
      } else if (e.code === "ArrowRight" && e.shiftKey) {
        seekBy(10);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seekBy]);

  const progress = duration ? (current / duration) * 100 : 0;

  // Auto-play when the shared countdown completes. Browsers may block
  // autoplay without a prior gesture — surface a clear "tap play" hint then.
  useEffect(() => {
    if (!started) return;
    const audio = audioRef.current;
    if (!audio) return;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => setAutoplayBlocked(false)).catch(() => setAutoplayBlocked(true));
    }
  }, [started]);

  return (
    <div className="sticky top-[70px] z-30 border-b border-white/10 bg-navy text-navy-foreground shadow-md">
      <audio ref={audioRef} src={asset(src)} preload="metadata" />
      <div className="mx-auto flex h-[90px] w-[95%] max-w-[1800px] items-center gap-3 sm:gap-5">
        {/* Transport */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause recording" : "Play recording"}
            className={cn(
              "relative flex h-12 w-12 items-center justify-center rounded-xl bg-white text-navy shadow-sm transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
              autoplayBlocked && !playing && "ring-2 ring-warning",
            )}
          >
            {autoplayBlocked && !playing && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-warning" />
              </span>
            )}
            {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </button>
          <ControlButton onClick={() => seekBy(-10)} label="Rewind 10 seconds">
            <Rewind className="h-4 w-4" />
            <span className="text-[10px] font-semibold">10</span>
          </ControlButton>
          <ControlButton onClick={() => seekBy(10)} label="Forward 10 seconds">
            <span className="text-[10px] font-semibold">10</span>
            <FastForward className="h-4 w-4" />
          </ControlButton>

          {countdown !== null && (
            <span className="ml-1 hidden items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
              <Timer className="h-3.5 w-3.5" aria-hidden /> Recording starts in {countdown}s
            </span>
          )}
          {autoplayBlocked && !playing && countdown === null && (
            <span className="ml-1 hidden items-center gap-1.5 rounded-full bg-warning/20 px-3 py-1 text-xs font-semibold text-white sm:inline-flex">
              Tap play to start the recording
            </span>
          )}
        </div>

        {/* Scrubber */}
        <div className="flex flex-1 items-center gap-3">
          <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums text-white/90">
            {formatTime(current)}
          </span>
          <div className="relative flex-1">
            <div className="absolute inset-y-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/20" />
            <div
              className="absolute inset-y-1/2 h-1.5 -translate-y-1/2 rounded-full bg-secondary"
              style={{ width: `${progress}%` }}
            />
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={current}
              onChange={(e) => seekTo(Number(e.target.value))}
              aria-label="Seek recording"
              disabled={!ready}
              className="track-slider relative z-10 w-full"
            />
          </div>
          <span className="w-12 shrink-0 text-sm font-medium tabular-nums text-white/90">
            {formatTime(duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-white/90 transition-colors hover:text-white"
          >
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => onVolume(Number(e.target.value))}
            aria-label="Volume"
            className="track-slider w-24"
          />
        </div>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="hidden text-xs font-medium text-white/60 lg:inline">Speed</span>
          <Select
            value={speed}
            onChange={(e) => onSpeed(Number(e.target.value))}
            aria-label="Playback speed"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {PLAYBACK_SPEEDS.map((s) => (
              <option key={s} value={s} className="text-foreground">
                {s.toFixed(2).replace(/0$/, "")}×
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-10 items-center gap-0.5 rounded-lg px-2 text-white/90 transition-colors hover:bg-white/10 hover:text-white",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60",
      )}
    >
      {children}
    </button>
  );
}
