import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../lib/audio.ts';
import { Fingerprint, ArrowRight } from 'lucide-react';

interface IntroSectionProps {
  hasVisitedBefore: boolean;
  onCalibrationComplete: () => void;
  onAction: () => void;
  onObservation: (msg: string) => void;
}

export const IntroSection: React.FC<IntroSectionProps> = ({
  hasVisitedBefore,
  onCalibrationComplete,
  onAction,
  onObservation,
}) => {
  const [holding, setHolding] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [calibrated, setCalibrated] = useState<boolean>(false);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (holding && !calibrated) {
      sound.playBioPulse();
      holdIntervalRef.current = setInterval(() => {
        setProgress((prev) => Math.min(100, prev + 6));
      }, 50);
    } else {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      if (!calibrated) {
        setProgress((prev) => Math.max(0, prev - 15));
      }
    }

    return () => {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
      }
    };
  }, [holding, calibrated]);

  // Cleanly handle calibration completion when progress reaches 100%
  useEffect(() => {
    if (progress >= 100 && !calibrated) {
      if (holdIntervalRef.current) {
        clearInterval(holdIntervalRef.current);
        holdIntervalRef.current = null;
      }
      setCalibrated(true);
      sound.playScanPing();
      onObservation('Baseline established. You really clicked that.');
    }
  }, [progress, calibrated, onObservation]);

  const handleStartHold = () => {
    onAction();
    setHolding(true);
  };

  const handleEndHold = () => {
    setHolding(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 sm:px-6 flex flex-col items-center text-center">
      {/* Editorial minimal typography */}
      <div className="space-y-4 mb-10">
        <p className="font-mono text-xs tracking-widest text-neutral-500 uppercase">
          {hasVisitedBefore ? 'SESSION RESUMPTION // RE-ENTRY' : 'SESSION INITIATION // PHASE 0'}
        </p>

        <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-neutral-100 font-sans">
          {hasVisitedBefore ? (
            <>
              You’re back. <span className="text-neutral-400">We noticed.</span>
            </>
          ) : (
            <>
              We need to <span className="text-neutral-400">check something.</span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-md mx-auto leading-relaxed">
          {hasVisitedBefore
            ? 'The previous diagnostic remains inconclusive. Please maintain composure while re-establishing contact.'
            : 'Please remain calm. A preliminary diagnostic routine has been configured for this device.'}
        </p>
      </div>

      {/* Interactive Contact / Calibration Touchpoint */}
      <div className="flex flex-col items-center gap-4 my-6">
        <div className="relative flex items-center justify-center">
          {/* Progress ring SVG */}
          <svg className="w-28 h-28 transform -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke="#1e293b"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx="56"
              cy="56"
              r="48"
              stroke={calibrated ? '#10b981' : '#38bdf8'}
              strokeWidth="3"
              strokeDasharray={301.59}
              strokeDashoffset={301.59 - (progress / 100) * 301.59}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-75"
            />
          </svg>

          {/* Central Touch Target */}
          <button
            type="button"
            onMouseDown={handleStartHold}
            onMouseUp={handleEndHold}
            onMouseLeave={handleEndHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleEndHold}
            disabled={calibrated}
            className={`absolute w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all select-none cursor-pointer ${
              calibrated
                ? 'bg-emerald-950/40 border border-emerald-500/80 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                : holding
                ? 'bg-neutral-800 border border-cyan-400 scale-95 text-cyan-300'
                : 'bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-neutral-400'
            }`}
          >
            <Fingerprint className="w-8 h-8 transition-transform group-hover:scale-105" />
          </button>
        </div>

        <div className="font-mono text-xs text-neutral-400">
          {calibrated ? (
            <span className="text-emerald-400 font-medium">
              Baseline synchronized. Interesting choice.
            </span>
          ) : holding ? (
            <span className="text-cyan-400">Acquiring pulse frequency: {progress}%</span>
          ) : (
            <span>[ Press and hold to calibrate ]</span>
          )}
        </div>
      </div>

      {/* Advance button */}
      {calibrated && (
        <div className="mt-6 animate-fade-in">
          <button
            type="button"
            onClick={() => {
              onAction();
              sound.playMechClick();
              onCalibrationComplete();
            }}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-neutral-100 hover:bg-white text-neutral-950 font-mono text-xs font-semibold tracking-wider uppercase transition-all shadow-lg hover:shadow-neutral-500/20 cursor-pointer"
          >
            <span>Proceed to Diagnostics</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
