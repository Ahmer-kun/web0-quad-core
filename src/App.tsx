import React, { useState, useEffect } from 'react';
import { useInteractionTracking } from './state/interactionStore.ts';
import { AudioToggle } from './components/AudioToggle.tsx';
import { BehavioralMonitor } from './components/BehavioralMonitor.tsx';
import { SpecimenCellCanvas } from './components/SpecimenCellCanvas.tsx';
import { MechanicalGauge } from './components/MechanicalGauge.tsx';
import { TwoWheelBalance } from './components/TwoWheelBalance.tsx';
import { IntroSection } from './sections/IntroSection.tsx';
import { FinalVerificationSection } from './sections/FinalVerificationSection.tsx';
import { sound } from './lib/audio.ts';
import { Dna, Gauge, Compass, ArrowRight, ShieldCheck, Check, AlertTriangle } from 'lucide-react';

type AppStage = 'intro' | 'diagnostics' | 'verification';
type DiagnosticTab = 'bio' | 'mech' | 'bike';

export default function App() {
  const [stage, setStage] = useState<AppStage>('intro');
  const [activeTab, setActiveTab] = useState<DiagnosticTab>('bio');
  const [inspectedTabs, setInspectedTabs] = useState<Set<DiagnosticTab>>(new Set(['bio']));
  const [showReloadWarning, setShowReloadWarning] = useState<boolean>(false);

  useEffect(() => {
    // 1. Native beforeunload warning when user attempts to reload or close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // 2. Intercept keyboard shortcuts (F5, Ctrl+R, Cmd+R) to show custom diagnostic warning modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'r')) {
        e.preventDefault();
        setShowReloadWarning(true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const {
    clickCount,
    discoveredSecrets,
    hasVisitedBefore,
    isIdle,
    rapidClickWarning,
    lastObservation,
    discoverSecret,
    logObservation,
  } = useInteractionTracking();

  const handleAction = () => {
    // Registered by global window click listener
  };

  const handleTabChange = (tab: DiagnosticTab) => {
    sound.playMechClick();
    setActiveTab(tab);
    setInspectedTabs((prev) => new Set([...prev, tab]));

    if (tab === 'bio') {
      logObservation('Inspecting cellular matrix. Specimen respiration noted.');
    } else if (tab === 'mech') {
      logObservation('Inspecting powertrain harmonics. Fuel consumption: irrational.');
    } else if (tab === 'bike') {
      logObservation('Inspecting two-wheel equilibrium. Physics: temporarily consulted.');
    }
  };

  const allTabsInspected = inspectedTabs.size >= 3;

  return (
    <div className="min-h-screen bg-[#090b0e] text-[#e2e8f0] flex flex-col justify-between selection:bg-neutral-800 selection:text-white">
      {/* Top Bar: Minimal chrome with audio toggle and discrete title */}
      <header className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between border-b border-neutral-900/80">
        <div>
          <span className="font-mono text-xs tracking-widest text-neutral-400 select-none uppercase">
            probably nothing
          </span>
        </div>

        <AudioToggle />
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {stage === 'intro' && (
          <IntroSection
            hasVisitedBefore={hasVisitedBefore}
            onCalibrationComplete={() => {
              setStage('diagnostics');
            }}
            onAction={handleAction}
            onObservation={logObservation}
          />
        )}

        {stage === 'diagnostics' && (
          <div className="w-full space-y-6">
            {/* Stage title & tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800/80 pb-4">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-500">
                  SYSTEM CHECKS
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-neutral-100 font-sans tracking-tight">
                  Interactive Diagnostics
                </h2>
              </div>

              {/* Subsystem switcher tabs */}
              <nav aria-label="Diagnostic Subsystems" className="flex items-center gap-1.5 bg-[#0d1015] p-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleTabChange('bio')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === 'bio'
                      ? 'bg-neutral-800 text-emerald-400 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Dna className="w-3.5 h-3.5" />
                  <span>01 // BIO</span>
                  {inspectedTabs.has('bio') && (
                    <Check className="w-3 h-3 text-emerald-500 ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('mech')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === 'mech'
                      ? 'bg-neutral-800 text-amber-400 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5" />
                  <span>02 // CAR</span>
                  {inspectedTabs.has('mech') && (
                    <Check className="w-3 h-3 text-amber-500 ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('bike')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === 'bike'
                      ? 'bg-neutral-800 text-cyan-400 font-medium'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>03 // BIKE</span>
                  {inspectedTabs.has('bike') && (
                    <Check className="w-3 h-3 text-cyan-500 ml-0.5" />
                  )}
                </button>
              </nav>
            </div>

            {/* Subsystem active card */}
            <div className="w-full">
              {activeTab === 'bio' && (
                <SpecimenCellCanvas
                  onSecretFound={discoverSecret}
                  onAction={handleAction}
                />
              )}

              {activeTab === 'mech' && (
                <MechanicalGauge
                  onSecretFound={discoverSecret}
                  onAction={handleAction}
                />
              )}

              {activeTab === 'bike' && (
                <TwoWheelBalance
                  onSecretFound={discoverSecret}
                  onAction={handleAction}
                />
              )}
            </div>

            {/* Advancement Bar to Final Verification */}
            <div className="bg-[#0d1015] border border-neutral-800/80 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 text-center sm:text-left">
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    allTabsInspected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-neutral-800 text-neutral-600'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>
                  {allTabsInspected
                    ? 'All three diagnostic domains cataloged. Ready for server verification.'
                    : `Cataloged subsystems: ${inspectedTabs.size}/3 (Inspect all domains before final submission).`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playScanPing();
                  setStage('verification');
                }}
                disabled={!allTabsInspected}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded font-mono text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                  allTabsInspected
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md hover:shadow-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {stage === 'verification' && (
          <FinalVerificationSection
            clickCount={clickCount}
            discoveredSecrets={discoveredSecrets}
            onAction={handleAction}
            onReset={() => {
              sound.playMechClick();
              setStage('intro');
            }}
          />
        )}
      </main>

      {/* Behavioral Observation Monitor Ticker */}
      <footer className="w-full py-2">
        <BehavioralMonitor
          lastObservation={lastObservation}
          isIdle={isIdle}
          rapidClickWarning={rapidClickWarning}
          clickCount={clickCount}
          secretsCount={discoveredSecrets.length}
        />
      </footer>

      {/* In-App Reload Warning Popup */}
      {showReloadWarning && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1117] border border-amber-500/50 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span className="text-xs uppercase tracking-widest font-bold">
                DIAGNOSTIC TELEMETRY WARNING
              </span>
            </div>
            <p className="text-sm text-neutral-300 font-sans leading-relaxed">
              Reloading or navigating away will terminate the active evaluation protocol.
              All biological, mechanical, and gyroscopic baselines will be reset.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowReloadWarning(false)}
                className="px-4 py-2 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
              >
                Remain in Diagnostic
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
                className="px-4 py-2 rounded bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-red-200 transition-colors cursor-pointer"
              >
                Abort & Reload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
