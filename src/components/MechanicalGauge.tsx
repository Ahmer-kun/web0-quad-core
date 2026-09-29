import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../lib/audio.ts';
import { Gauge, AlertTriangle } from 'lucide-react';

interface MechanicalGaugeProps {
  onSecretFound: (id: string, text: string) => void;
  onAction: () => void;
}

export const MechanicalGauge: React.FC<MechanicalGaugeProps> = ({
  onSecretFound,
  onAction,
}) => {
  const [rpm, setRpm] = useState<number>(850); // idle RPM
  const [isAccelerating, setIsAccelerating] = useState<boolean>(false);
  const [pedalPressCount, setPedalPressCount] = useState<number>(0);
  const [gaugeMessage, setGaugeMessage] = useState<string>('Engine: probably fine.');
  const revIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Throttle revving physics loop
  useEffect(() => {
    if (isAccelerating) {
      sound.playMechClick();
      revIntervalRef.current = setInterval(() => {
        setRpm((prev) => {
          const next = Math.min(7800, prev + 240 + Math.floor(Math.random() * 80));
          if (next > 6500) {
            setGaugeMessage('Mechanical integrity: emotionally uncertain.');
          } else if (next > 4200) {
            setGaugeMessage('RPM detected. Speed: unnecessary. Driver judgment: questionable.');
          } else if (next > 2200) {
            setGaugeMessage('Internal combustion simulated. Fuel: irrelevant.');
          }
          return next;
        });
      }, 50);
    } else {
      if (revIntervalRef.current) {
        clearInterval(revIntervalRef.current);
        revIntervalRef.current = null;
      }
      const idleDecay = setInterval(() => {
        setRpm((prev) => {
          if (prev <= 860) {
            clearInterval(idleDecay);
            return 850;
          }
          return Math.max(850, prev - 180);
        });
      }, 40);
      return () => clearInterval(idleDecay);
    }

    return () => {
      if (revIntervalRef.current) {
        clearInterval(revIntervalRef.current);
      }
    };
  }, [isAccelerating]);

  const handleStartPedal = () => {
    onAction();
    setIsAccelerating(true);
    setPedalPressCount((p) => p + 1);
  };

  const handleStopPedal = () => {
    setIsAccelerating(false);
  };

  const handleCheckEngineClick = () => {
    onAction();
    sound.playScanPing();
    onSecretFound(
      'car_check_engine',
      'Diagnostic complete. The car is fine. You are the variable.'
    );
    setGaugeMessage('Check engine scan: The car is fine. You are the variable.');
  };

  // Calculate needle rotation: 800 RPM = -120deg, 8000 RPM = +120deg
  const normalized = Math.min(1, Math.max(0, (rpm - 800) / 7200));
  const needleDeg = -120 + normalized * 240;

  return (
    <div className="w-full bg-[#0d1015] border border-neutral-800/90 rounded-lg p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-5">
        <div>
          <span className="text-[10px] tracking-widest uppercase font-mono text-amber-500">
            POWERTRAIN TELEMETRY // COMBUSTION MODULE
          </span>
          <h3 className="text-base font-semibold text-neutral-100 font-sans tracking-tight">
            Vehicle System Check
          </h3>
        </div>

        {/* Easter egg check engine button */}
        <button
          onClick={handleCheckEngineClick}
          type="button"
          className="group flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090b0e] border border-amber-900/50 hover:border-amber-500/80 transition-all cursor-pointer"
          title="Click to query onboard OBD-II system"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 group-hover:animate-pulse" />
          <span className="text-[10px] font-mono text-amber-400/90">MIL // DTC</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Tachometer Dial */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-52 h-52 rounded-full border border-neutral-800 bg-[#07090c] flex items-center justify-center shadow-inner">
            {/* Tick marks around perimeter */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
              {Array.from({ length: 9 }).map((_, i) => {
                const angle = (-120 + (i / 8) * 240) * (Math.PI / 180);
                const x1 = 100 + Math.cos(angle) * 82;
                const y1 = 100 + Math.sin(angle) * 82;
                const x2 = 100 + Math.cos(angle) * 72;
                const y2 = 100 + Math.sin(angle) * 72;
                const isRedline = i >= 7;
                return (
                  <g key={i}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isRedline ? '#ef4444' : '#64748b'}
                      strokeWidth={isRedline ? '2.5' : '1.5'}
                    />
                    <text
                      x={100 + Math.cos(angle) * 60}
                      y={100 + Math.sin(angle) * 60 + 3}
                      fill={isRedline ? '#ef4444' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Gauge Needle */}
            <div
              className="absolute w-1 h-20 bg-amber-400 origin-bottom rounded-full transition-transform duration-75"
              style={{
                transform: `rotate(${needleDeg}deg)`,
                bottom: '50%',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)',
              }}
            />

            {/* Needle center cap */}
            <div className="z-10 w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            </div>

            {/* Digital readout below needle */}
            <div className="absolute bottom-9 text-center font-mono">
              <div className="text-xl font-bold tracking-tight text-neutral-100">
                {rpm.toLocaleString()}
              </div>
              <div className="text-[9px] text-neutral-500 uppercase tracking-widest">
                RPM x1000
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] font-mono text-neutral-400">
            Powertrain Harmonic Sensor: Active
          </p>
        </div>

        {/* Diagnostic Metrics & Throttle Button */}
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#080a0d] p-3.5 rounded border border-neutral-800/80 space-y-2">
            <div className="flex justify-between items-center text-neutral-400">
              <span>Engine status:</span>
              <span className="text-amber-400 font-medium">Probably fine</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Hydraulic brakes:</span>
              <span className="text-neutral-300">Hopefully</span>
            </div>
            <div className="flex justify-between items-center text-neutral-400">
              <span>Driver judgment:</span>
              <span className="text-neutral-300">Questionable</span>
            </div>
          </div>

          {/* Interactive Accelerator / Throttle Pedal */}
          <div className="pt-1">
            <button
              type="button"
              onMouseDown={handleStartPedal}
              onMouseUp={handleStopPedal}
              onMouseLeave={handleStopPedal}
              onTouchStart={handleStartPedal}
              onTouchEnd={handleStopPedal}
              className={`w-full py-3.5 px-4 rounded text-center border font-mono font-bold tracking-wider uppercase transition-all select-none cursor-pointer ${
                isAccelerating
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-[#080a0d] border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
              }`}
            >
              {isAccelerating ? 'THROTTLE ENGAGED (HOLDING)' : 'PRESS & HOLD THROTTLE'}
            </button>
            <div className="text-[10px] text-neutral-400 text-center mt-1.5 font-mono">
              [ Hold down to apply throttle load ]
            </div>
          </div>

          {/* Dynamic observation line */}
          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded text-[11px] text-neutral-300 italic min-h-[44px] flex items-center">
            "{gaugeMessage}"
          </div>
        </div>
      </div>
    </div>
  );
};
