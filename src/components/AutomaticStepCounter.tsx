import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Activity,
  Smartphone,
  Flame,
  Footprints,
  Compass,
  Play,
  Pause,
  Plus,
  Minus,
  RefreshCw,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Volume2,
  VolumeX,
  Edit3,
  History,
  Check,
  RotateCcw,
  Layers,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '../types';

interface AutomaticStepCounterProps {
  initialSteps: number;
  stepGoal: number;
  profile: StudentProfile | null;
  onUpdateSteps: (newSteps: number, method: string) => void;
  isDarkMode: boolean;
}

interface ManualLogEntry {
  id: string;
  activity: string;
  stepsAdded: number;
  timestamp: string;
}

export const AutomaticStepCounter: React.FC<AutomaticStepCounterProps> = ({
  initialSteps,
  stepGoal,
  profile,
  onUpdateSteps,
  isDarkMode,
}) => {
  const [steps, setSteps] = useState(initialSteps);
  const [viewLayout, setViewLayout] = useState<'dual' | 'automated' | 'manual'>('dual');

  // Automated Sensor state
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorSupported, setSensorSupported] = useState<boolean | null>(null);
  const [, setSensorPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [currentAccelMagnitude, setCurrentAccelMagnitude] = useState<number>(0);

  // Cloud Integrations state
  const [googleFitConnected, setGoogleFitConnected] = useState(false);
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Walking simulator state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<'walk' | 'brisk' | 'jog'>('walk');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Battery saver mode
  const [batterySaverMode, setBatterySaverMode] = useState(false);

  // Cadence tracking
  const [cadence, setCadence] = useState<number>(0);
  const stepTimesRef = useRef<number[]>([]);
  const lastStepTimeRef = useRef<number>(0);

  // Manual Counter State
  const [manualInputValue, setManualInputValue] = useState<string>('');
  const [manualActivityType, setManualActivityType] = useState<string>('Campus Walking');
  const [tapCounterSession, setTapCounterSession] = useState<number>(0);
  const [manualLogs, setManualLogs] = useState<ManualLogEntry[]>([
    {
      id: 'log-1',
      activity: 'Hostel to Library Walk',
      stepsAdded: 1200,
      timestamp: 'Today, 2:15 PM',
    },
    {
      id: 'log-2',
      activity: 'Academic Stairs (3rd Floor Lab)',
      stepsAdded: 450,
      timestamp: 'Today, 11:30 AM',
    },
  ]);
  const [manualSuccessMsg, setManualSuccessMsg] = useState<string | null>(null);

  // Calculations
  const weightKg = profile?.weight || 68;
  const strideLengthM = ((profile?.height || 175) * 0.43) / 100;
  const distanceKm = parseFloat(((steps * strideLengthM) / 1000).toFixed(2));
  const estimatedCalories = Math.round(weightKg * distanceKm * 0.78);
  const activeMinutes = Math.min(240, Math.round(steps / 110));
  const progressPercent = Math.min(100, Math.round((steps / stepGoal) * 100));

  // Sync with prop if changed externally
  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  // Check DeviceMotionEvent support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      setSensorSupported(true);
    } else {
      setSensorSupported(false);
    }
  }, []);

  // Beep sound for step feedback
  const playStepSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch {
      // Audio not permitted
    }
  }, [soundEnabled]);

  // Register a step (either automated or manual)
  const registerStep = useCallback(
    (count = 1, methodUsed: string = 'sensor') => {
      setSteps((prev) => {
        const next = Math.max(0, prev + count);
        onUpdateSteps(next, methodUsed);

        if (prev < stepGoal && next >= stepGoal) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        return next;
      });

      playStepSound();

      const now = Date.now();
      lastStepTimeRef.current = now;
      stepTimesRef.current.push(now);
      stepTimesRef.current = stepTimesRef.current.filter((t) => now - t <= 5000);
      const stepsInWindow = stepTimesRef.current.length;
      setCadence(Math.round((stepsInWindow / 5) * 60));
    },
    [onUpdateSteps, stepGoal, playStepSound]
  );

  // Accelerometer Handler
  useEffect(() => {
    if (!sensorActive) return;

    let lastAccel = 0;
    const threshold = 1.8;
    const minStepIntervalMs = 320;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      const magnitude = Math.sqrt(x * x + y * y + z * z);
      setCurrentAccelMagnitude(parseFloat(magnitude.toFixed(2)));

      const delta = Math.abs(magnitude - lastAccel);
      const now = Date.now();

      if (delta > threshold && now - lastStepTimeRef.current > minStepIntervalMs) {
        registerStep(1, 'mobile-accelerometer');
      }

      lastAccel = magnitude;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [sensorActive, registerStep]);

  // Toggle mobile sensor
  const toggleMobileSensor = async () => {
    if (sensorActive) {
      setSensorActive(false);
      return;
    }

    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const permission = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (permission === 'granted') {
          setSensorPermission('granted');
          setSensorActive(true);
        } else {
          setSensorPermission('denied');
          alert('Motion sensor permission is required for real-time mobile step detection.');
        }
      } catch (err) {
        console.error('Permission request failed:', err);
        setSensorActive(true);
      }
    } else {
      setSensorPermission('granted');
      setSensorActive(true);
    }
  };

  // Walking Simulator Loop
  useEffect(() => {
    if (!isSimulating) return;

    const intervalMap = {
      walk: 540,
      brisk: 450,
      jog: 360,
    };

    const interval = setInterval(() => {
      registerStep(1, 'walking-simulator');
    }, intervalMap[simSpeed]);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, registerStep]);

  // Google Fit Sync
  const handleGoogleFitSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setGoogleFitConnected(true);
      const syncedSteps = steps + 320;
      setSteps(syncedSteps);
      onUpdateSteps(syncedSteps, 'google-fit');
    }, 1200);
  };

  // Apple Health Sync
  const handleAppleHealthSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setAppleHealthConnected(true);
      const syncedSteps = steps + 410;
      setSteps(syncedSteps);
      onUpdateSteps(syncedSteps, 'apple-health');
    }, 1200);
  };

  // Manual Step Tap Button Clicker
  const handleManualTap = () => {
    setTapCounterSession((prev) => prev + 1);
    registerStep(1, 'manual-tap');
  };

  // Manual Batch Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = parseInt(manualInputValue, 10);
    if (isNaN(count) || count <= 0) return;

    registerStep(count, 'manual-batch');
    const newEntry: ManualLogEntry = {
      id: `log-${Date.now()}`,
      activity: manualActivityType,
      stepsAdded: count,
      timestamp: 'Just now',
    };
    setManualLogs((prev) => [newEntry, ...prev.slice(0, 4)]);
    setManualInputValue('');
    setManualSuccessMsg(`Logged +${count.toLocaleString()} steps (${manualActivityType})!`);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });
    setTimeout(() => setManualSuccessMsg(null), 3000);
  };

  // Preset Campus Quick Add
  const handlePresetAdd = (label: string, count: number) => {
    registerStep(count, 'manual-preset');
    const newEntry: ManualLogEntry = {
      id: `log-${Date.now()}`,
      activity: label,
      stepsAdded: count,
      timestamp: 'Just now',
    };
    setManualLogs((prev) => [newEntry, ...prev.slice(0, 4)]);
    setManualSuccessMsg(`Logged +${count.toLocaleString()} steps (${label})!`);
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.7 },
    });
    setTimeout(() => setManualSuccessMsg(null), 3000);
  };

  // Manual Step Adjustments
  const handleStepAdjustment = (delta: number) => {
    registerStep(delta, 'manual-adjust');
    setManualSuccessMsg(`${delta > 0 ? '+' : ''}${delta} steps adjusted`);
    setTimeout(() => setManualSuccessMsg(null), 2000);
  };

  return (
    <div
      className={`rounded-3xl transition-all duration-300 p-6 md:p-8 space-y-8 ${
        batterySaverMode
          ? 'bg-black text-emerald-400 border border-emerald-950 shadow-none'
          : isDarkMode
          ? 'glass-panel text-slate-100 shadow-2xl'
          : 'glass-panel-light text-slate-800 shadow-xl'
      }`}
    >
      {/* 1. TOP HEADER & VIEW CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Footprints className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight font-display">
              Step Counter Suite
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Dual-Engine
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Automated sensor tracking & dedicated manual step logger running side-by-side.
          </p>
        </div>

        {/* View Layout Selector & Utility Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dual / Automated / Manual Layout Switcher */}
          <div className="inline-flex rounded-2xl bg-slate-900/90 p-1 border border-slate-800 text-xs">
            <button
              onClick={() => setViewLayout('dual')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'dual'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewLayout('automated')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'automated'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Automated</span>
            </button>
            <button
              onClick={() => setViewLayout('manual')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                viewLayout === 'manual'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Manual</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
            title="Step Click Sound Feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* OLED Battery Saver Toggle */}
          <button
            onClick={() => setBatterySaverMode(!batterySaverMode)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
              batterySaverMode
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BatteryCharging className="w-4 h-4" />
            <span>{batterySaverMode ? 'OLED Saver ON' : 'OLED Saver'}</span>
          </button>
        </div>
      </div>

      {/* 2. OVERALL REAL-TIME METRICS BANNER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase">Total Steps</div>
            <div className="text-xl md:text-2xl font-black font-display text-white">
              {steps.toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400">{progressPercent}% of Goal</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase">Distance</div>
            <div className="text-xl md:text-2xl font-black font-display text-cyan-400">
              {distanceKm} <span className="text-xs font-normal text-slate-400">km</span>
            </div>
            <div className="text-[10px] text-slate-400">Campus paths</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase">Est. Burned</div>
            <div className="text-xl md:text-2xl font-black font-display text-orange-400">
              {estimatedCalories} <span className="text-xs font-normal text-slate-400">kcal</span>
            </div>
            <div className="text-[10px] text-slate-400">Active energy</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-mono uppercase">Active Time</div>
            <div className="text-xl md:text-2xl font-black font-display text-indigo-400">
              {activeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-slate-400">Campus movement</div>
          </div>
        </div>
      </div>

      {/* 3. SIDE-BY-SIDE DUAL COLUMN SECTION */}
      <div
        className={`grid gap-8 items-start ${
          viewLayout === 'dual'
            ? 'grid-cols-1 lg:grid-cols-12'
            : 'grid-cols-1'
        }`}
      >
        {/* ==================================================== */}
        {/* COLUMN 1: AUTOMATED STEP COUNTER ENGINE              */}
        {/* ==================================================== */}
        {(viewLayout === 'dual' || viewLayout === 'automated') && (
          <div
            className={`space-y-6 rounded-3xl p-6 bg-slate-900/40 border border-slate-800/80 ${
              viewLayout === 'dual' ? 'lg:col-span-6' : 'w-full'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="font-bold text-base text-white font-display">
                  Automated Step Counter
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {sensorActive ? 'Sensors Active' : isSimulating ? 'Simulating' : 'Ready'}
              </span>
            </div>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-700 ${
                    sensorActive || isSimulating ? 'animate-pulse-ring bg-emerald-500/10' : ''
                  }`}
                />
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="7"
                    fill="transparent"
                    className={batterySaverMode ? 'stroke-neutral-900' : 'stroke-slate-800'}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    strokeWidth="7"
                    fill="transparent"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="stroke-emerald-400 transition-all duration-500 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold tracking-wider">
                    {sensorActive ? 'LIVE TRACKING' : 'CURRENT TOTAL'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-display my-0.5">
                    {steps.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    of {stepGoal.toLocaleString()} goal
                  </span>
                  {cadence > 0 && (
                    <span className="mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                      {cadence} steps/min
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Sensor Status Strip */}
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-medium">3-Axis Mobile Accelerometer:</span>
              </div>
              <span className="font-mono text-emerald-400">
                {sensorActive ? `${currentAccelMagnitude} m/s²` : 'Idle'}
              </span>
            </div>

            {/* Automated Tracking Controls */}
            <div className="space-y-3">
              <button
                onClick={toggleMobileSensor}
                className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  sensorActive
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                }`}
              >
                {sensorActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{sensorActive ? 'Stop Accelerometer Sensor' : 'Start Mobile Accelerometer'}</span>
              </button>
              {sensorSupported === false && (
                <p className="text-[10px] text-amber-400/90 text-center">
                  (Device accelerometer is unavailable on desktop browsers — use simulator below or the manual counter on the right)
                </p>
              )}

              {/* Cloud Sync Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleGoogleFitSync}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{googleFitConnected ? 'Synced Google Fit' : 'Sync Google Fit'}</span>
                </button>
                <button
                  onClick={handleAppleHealthSync}
                  disabled={isSyncing}
                  className="py-2.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-indigo-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{appleHealthConnected ? 'Synced Apple Health' : 'Sync Apple Health'}</span>
                </button>
              </div>

              {/* Walking Simulator */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Live Walking Simulator</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      onClick={() => setSimSpeed('walk')}
                      className={`px-2 py-0.5 rounded-md ${
                        simSpeed === 'walk' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Walk
                    </button>
                    <button
                      onClick={() => setSimSpeed('brisk')}
                      className={`px-2 py-0.5 rounded-md ${
                        simSpeed === 'brisk' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Brisk
                    </button>
                    <button
                      onClick={() => setSimSpeed('jog')}
                      className={`px-2 py-0.5 rounded-md ${
                        simSpeed === 'jog' ? 'bg-purple-500 text-slate-950 font-bold' : 'text-slate-400'
                      }`}
                    >
                      Jog
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSimulating
                      ? 'bg-purple-500 text-slate-950'
                      : 'bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? 'Stop Walking Simulation' : 'Start Walking Simulator'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* COLUMN 2: MANUAL STEP COUNTER & ACTIVITY LOGGER     */}
        {/* ==================================================== */}
        {(viewLayout === 'dual' || viewLayout === 'manual') && (
          <div
            className={`space-y-6 rounded-3xl p-6 bg-slate-900/40 border border-slate-800/80 ${
              viewLayout === 'dual' ? 'lg:col-span-6' : 'w-full'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-base text-white font-display">
                  Manual Step Counter
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                Direct Input & Logging
              </span>
            </div>

            {/* Success Alert */}
            {manualSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>{manualSuccessMsg}</span>
              </div>
            )}

            {/* A. Interactive Step Clicker / Tapper Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-blue-950/30 border border-cyan-500/20 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Interactive Step Tapper</span>
                <span className="font-mono text-cyan-400">{tapCounterSession} tapped this session</span>
              </div>

              <button
                onClick={handleManualTap}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Footprints className="w-5 h-5" />
                <span>TAP TO COUNT STEP (+1)</span>
              </button>
              <p className="text-[11px] text-slate-400">
                Click with each stride on campus, or use the form below for bulk steps.
              </p>
            </div>

            {/* B. Direct Numeric Input Form */}
            <form onSubmit={handleManualSubmit} className="space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Enter Exact Steps (Smartwatch / Treadmill / Walk)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Step Count</label>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    placeholder="e.g. 1500"
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Activity Context</label>
                  <select
                    value={manualActivityType}
                    onChange={(e) => setManualActivityType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Campus Walking">Campus Walking</option>
                    <option value="Hostel to Academic Block">Hostel to Academic Block</option>
                    <option value="Campus Running / Jogging">Campus Running / Jogging</option>
                    <option value="Library Staircase Climb">Library Staircase Climb</option>
                    <option value="Badminton / Campus Sports">Badminton / Campus Sports</option>
                    <option value="Treadmill / Gym Session">Treadmill / Gym Session</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!manualInputValue || parseInt(manualInputValue, 10) <= 0}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Steps to Today's Record</span>
              </button>
            </form>

            {/* C. Quick Campus Activity Presets */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Quick Campus Activity Presets
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handlePresetAdd('Academic Stairs (3 Floors)', 450)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400">
                    🏛️ Academic Stairs
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                    <span>3 Floors Lab</span>
                    <span className="text-cyan-400 font-bold">+450</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePresetAdd('Hostel to Library Walk', 1200)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400">
                    🚶 Hostel → Library
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                    <span>Campus Path</span>
                    <span className="text-cyan-400 font-bold">+1,200</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePresetAdd('Sports Oval Lap', 2500)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400">
                    🏃 Sports Ground Lap
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                    <span>Running Track</span>
                    <span className="text-cyan-400 font-bold">+2,500</span>
                  </div>
                </button>

                <button
                  onClick={() => handlePresetAdd('Badminton / Court Sports', 3200)}
                  className="p-3 rounded-xl bg-slate-950/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-cyan-400">
                    🏸 Campus Badminton
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                    <span>30m Match</span>
                    <span className="text-cyan-400 font-bold">+3,200</span>
                  </div>
                </button>
              </div>
            </div>

            {/* D. Increment / Adjustment Steppers */}
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Quick Increments & Adjustments
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => handleStepAdjustment(100)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 100
                </button>
                <button
                  onClick={() => handleStepAdjustment(250)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 250
                </button>
                <button
                  onClick={() => handleStepAdjustment(500)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-emerald-400" /> 500
                </button>
                <button
                  onClick={() => handleStepAdjustment(1000)}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> 1,000
                </button>
                <div className="w-[1px] h-5 bg-slate-800 mx-1" />
                <button
                  onClick={() => handleStepAdjustment(-100)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900 text-rose-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Subtract in case of accidental entry"
                >
                  <Minus className="w-3 h-3" /> 100
                </button>
              </div>
            </div>

            {/* E. Recent Manual Logging Session History */}
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recent Manual Sessions</span>
                </div>
                <span className="text-[10px] text-slate-500">{manualLogs.length} logs</span>
              </div>

              <div className="space-y-1.5">
                {manualLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{log.activity}</div>
                      <div className="text-[10px] text-slate-500">{log.timestamp}</div>
                    </div>
                    <span className="font-mono font-bold text-cyan-400">
                      +{log.stepsAdded.toLocaleString()} steps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
