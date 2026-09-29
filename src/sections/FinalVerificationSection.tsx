import React, { useState } from 'react';
import { sound } from '../lib/audio.ts';
import {
  ShieldCheck,
  Cpu,
  Globe,
  Activity,
  RotateCcw,
  CheckCircle2,
  Lock,
  MapPin,
  Radio,
  Battery,
  Wifi,
  MousePointer,
  Send,
  X,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface FinalVerificationSectionProps {
  clickCount: number;
  discoveredSecrets: string[];
  onAction: () => void;
  onReset: () => void;
}

interface VerificationResult {
  success: boolean;
  verificationId: string;
  timestamp: string;
  network: {
    ipAddress: string;
    protocol: string;
    source: string;
    userAgent: string;
    browser: string;
    os: string;
    language: string;
    location?: string;
    city?: string;
    region?: string;
    country?: string;
    isp?: string;
  };
  clientData: {
    viewport: string;
    timezone: string;
    interactionCount: number;
    discoveredSecretsCount: number;
  };
  hardware?: {
    cpuCores: string;
    deviceMemory: string;
    batteryStatus: string;
    connectionType: string;
    inputMechanism: string;
  };
  theatricalDiagnostics: {
    biological: { label: string; status: string; detail: string };
    mechanical: { label: string; status: string; detail: string };
    bike: { label: string; status: string; detail: string };
    macAddress: { label: string; status: string; detail: string };
    commonSense: { label: string; status: string; detail: string };
  };
  punchline: {
    primary: string;
    secondary: string;
    tertiary: string;
    closing: string;
  };
}

export const FinalVerificationSection: React.FC<FinalVerificationSectionProps> = ({
  clickCount,
  discoveredSecrets,
  onAction,
  onReset,
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [scanStage, setScanStage] = useState<string>('');
  const [result, setResult] = useState<VerificationResult | null>(null);

  // Punchline typewriter/pause progression
  const [punchlineStep, setPunchlineStep] = useState<number>(0);

  // Dispatch feedback state
  const [dispatchStatus, setDispatchStatus] = useState<{
    submittingToOwner: boolean;
    submitted: boolean;
    message: string | null;
  }>({
    submittingToOwner: false,
    submitted: false,
    message: null,
  });

  // Suspense modal shown for 2 seconds when ANY button is clicked
  const [suspenseModal, setSuspenseModal] = useState<{
    active: boolean;
    buttonType: 'submit' | 'close' | 'repeat';
    status: 'transmitting' | 'confirmed';
  } | null>(null);

  const forwardToOwner = async (trigger: 'submit' | 'close' | 'repeat', currentResult: VerificationResult) => {
    try {
      await fetch('/api/forward-to-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          triggerButton: trigger,
          verificationId: currentResult.verificationId,
          dossier: currentResult,
        }),
      });
    } catch (err) {
      console.error('Transmission to site owner failed:', err);
    }
  };

  const handleInitiateVerification = async () => {
    onAction();
    sound.playMechClick();
    setSubmitting(true);
    setScanStage('ESTABLISHING SECURE CONNECTION...');

    // Multi-phase scanner theatrics while waiting for server response
    setTimeout(() => {
      setScanStage('RESOLVING GEOGRAPHIC TELEMETRY & ROUTE...');
      sound.playBioPulse();
    }, 500);

    setTimeout(() => {
      setScanStage('EXTRACTING LOGIC CORES & POWER RESERVES...');
      sound.playScanPing();
    }, 1100);

    // Harvest hardware & power stats from browser APIs
    let batteryInfo = 'AC Powered / Unknown';
    try {
      const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> };
      if (typeof nav.getBattery === 'function') {
        const battery = await nav.getBattery();
        const pct = Math.round(battery.level * 100);
        batteryInfo = battery.charging ? `${pct}% (AC Charging)` : `${pct}% (Discharging)`;
      }
    } catch {
      // Optional
    }

    const navAny = navigator as unknown as {
      hardwareConcurrency?: number;
      deviceMemory?: number;
      connection?: { effectiveType?: string; downlink?: number };
    };

    const cpuCores = navAny.hardwareConcurrency ? `${navAny.hardwareConcurrency} Cores` : 'Standard Architecture';
    const deviceMemory = navAny.deviceMemory ? `${navAny.deviceMemory} GB RAM` : 'Allocated Memory';
    const connectionType = navAny.connection?.effectiveType
      ? `${navAny.connection.effectiveType.toUpperCase()} (~${navAny.connection.downlink || 10} Mbps)`
      : 'Broadband Interface';
    const inputMechanism = window.matchMedia('(pointer: coarse)').matches
      ? 'Capacitive Touchscreen'
      : 'Precision Optical Mouse';

    try {
      const payload = {
        screenWidth: window.screen ? window.screen.width : window.innerWidth,
        screenHeight: window.screen ? window.screen.height : window.innerHeight,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        interactionCount: clickCount + 1,
        discoveredSecrets,
        cpuCores: navAny.hardwareConcurrency || null,
        deviceMemory: navAny.deviceMemory || null,
        batteryStatus: batteryInfo,
        connectionType,
        inputMechanism,
        clientTimestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: VerificationResult = await response.json();

      setTimeout(() => {
        setResult(data);
        setSubmitting(false);
        sound.playScanPing();

        // Sequence comedic punchlines
        setTimeout(() => setPunchlineStep(1), 600);
        setTimeout(() => setPunchlineStep(2), 2000);
        setTimeout(() => setPunchlineStep(3), 3600);
        setTimeout(() => setPunchlineStep(4), 5200);
      }, 1600);
    } catch (err) {
      console.error('Verification query failed:', err);
      // Safe fallback
      setTimeout(() => {
        const fallbackResult: VerificationResult = {
          success: true,
          verificationId: `diag-local-${Date.now().toString(36)}`,
          timestamp: new Date().toISOString(),
          network: {
            ipAddress: '127.0.0.1',
            protocol: 'Internal Loopback',
            source: 'client-fallback',
            userAgent: navigator.userAgent,
            browser: 'Browser Runtime',
            os: 'Host OS',
            language: navigator.language,
            location: 'Localhost Subnet',
            isp: 'Internal Loopback Bus',
          },
          clientData: {
            viewport: `${window.innerWidth} × ${window.innerHeight}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            interactionCount: clickCount + 1,
            discoveredSecretsCount: discoveredSecrets.length,
          },
          hardware: {
            cpuCores,
            deviceMemory,
            batteryStatus: batteryInfo,
            connectionType,
            inputMechanism,
          },
          theatricalDiagnostics: {
            biological: {
              label: 'BIOLOGICAL INTEGRITY',
              status: 'Suspiciously alive',
              detail: 'Specimen maintains homeostasis despite network anomalies.',
            },
            mechanical: {
              label: 'VEHICLE / ENGINE INTEGRITY',
              status: 'Operational',
              detail: 'RPM detected. Brakes: hopeful. Driver judgment: questionable.',
            },
            bike: {
              label: 'TWO-WHEEL SYSTEM',
              status: 'Two wheels assumed',
              detail: 'Chain: connected. Stability is now your responsibility.',
            },
            macAddress: {
              label: 'HARDWARE MAC ADDRESS',
              status: 'ACCESS DENIED',
              detail: 'Web browsers intentionally forbid physical MAC reading. Nice try.',
            },
            commonSense: {
              label: 'COMMON SENSE DETECTION',
              status: 'Not detected',
              detail: 'Specimen reached the end of this diagnostic anyway.',
            },
          },
          punchline: {
            primary: 'DATA ACQUISITION COMPLETE.',
            secondary: 'Don’t worry.',
            tertiary: 'We have absolutely no idea what to do with it.',
            closing: 'Thank you for participating in this extremely unnecessary scientific experiment.',
          },
        };
        setResult(fallbackResult);
        setSubmitting(false);
        setTimeout(() => setPunchlineStep(1), 600);
        setTimeout(() => setPunchlineStep(2), 1800);
        setTimeout(() => setPunchlineStep(3), 3200);
        setTimeout(() => setPunchlineStep(4), 4800);
      }, 1600);
    }
  };

  // Unified button trigger with high-tension 2-second suspense pause
  const triggerForwardWithSuspense = async (buttonType: 'submit' | 'close' | 'repeat') => {
    if (!result || suspenseModal) return;
    onAction();
    sound.playMechClick();
    sound.playBioPulse();

    // 1. Enter suspense state immediately and lock screen
    setSuspenseModal({
      active: true,
      buttonType,
      status: 'transmitting',
    });

    // 2. Transmit to site owner in background
    const dispatchPromise = forwardToOwner(buttonType, result);

    // 3. Keep on screen for high tension (1100ms sending -> 900ms confirmed)
    setTimeout(() => {
      sound.playScanPing();
      setSuspenseModal((prev) => (prev ? { ...prev, status: 'confirmed' } : null));
    }, 1100);

    setTimeout(async () => {
      await dispatchPromise;
      if (buttonType === 'submit') {
        setSuspenseModal(null);
        setDispatchStatus({
          submittingToOwner: false,
          submitted: true,
          message: 'Evaluation telemetry successfully forwarded to site administration.',
        });
      } else {
        // 'close' or 'repeat'
        setSuspenseModal(null);
        onReset();
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
      {/* High-Tension Suspense Modal (Stays on screen for 2s to scare em) */}
      {suspenseModal && result && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0b0e14] border-2 border-red-500/80 rounded-xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_60px_rgba(239,68,68,0.3)] space-y-5 font-mono">
            {/* Header */}
            <div className="flex items-center gap-2.5 text-red-400">
              <AlertTriangle className="w-5 h-5 animate-pulse shrink-0" />
              <span className="text-xs uppercase tracking-widest font-bold">
                {suspenseModal.status === 'transmitting'
                  ? 'TRANSMITTING SPECIMEN DOSSIER TO SITE OWNER...'
                  : 'TRANSMISSION CONFIRMED // DOSSIER ARCHIVED'}
              </span>
            </div>

            {/* Live Telemetry Trace */}
            <div className="bg-[#06080b] border border-neutral-800 rounded p-4 text-xs space-y-2 text-neutral-300">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-1.5">
                <span className="text-neutral-500 text-[11px]">DESTINATION GATEWAY:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-400/90 text-xs select-none blur-[5px] tracking-widest bg-black/80 px-2 py-0.5 rounded border border-emerald-900/50">
                    admin.ops@gateway-node.sec
                  </span>
                  <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-950/70 border border-red-800/60 text-red-300 font-mono">
                    CLASSIFIED
                  </span>
                </div>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                <span className="text-neutral-500 text-[11px]">SOURCE IP:</span>
                <span className="text-neutral-200 break-all">{result.network.ipAddress}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                <span className="text-neutral-500 text-[11px]">GEO LOCATION:</span>
                <span className="text-neutral-200">{result.network.location || 'Resolved Coordinates'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 text-[11px]">TRIGGER ACTION:</span>
                <span className="text-amber-400 uppercase font-semibold">
                  {suspenseModal.buttonType === 'close'
                    ? 'TERMINATION VIA CLOSE BUTTON'
                    : suspenseModal.buttonType === 'submit'
                    ? 'VERIFICATION SUBMISSION'
                    : 'REPEAT EVALUATION REQUEST'}
                </span>
              </div>
            </div>

            {/* Suspense Progress Bar & Message */}
            <div className="space-y-2">
              <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    suspenseModal.status === 'confirmed' ? 'w-full bg-emerald-500' : 'w-3/4 bg-red-500 animate-pulse'
                  }`}
                />
              </div>
              <p className="text-[11px] text-neutral-400 italic text-center">
                {suspenseModal.status === 'transmitting'
                  ? 'Active socket route. Transmitting telemetry to administrator inbox...'
                  : 'Delivery confirmed. Site administrator received full telemetry snapshot.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!result ? (
        <div className="bg-[#0d1015] border border-neutral-800 rounded-xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          <div className="inline-flex p-3 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-widest uppercase font-mono text-neutral-500">
              SYNTHESIS // CONVERGENCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-light text-neutral-100 font-sans tracking-tight">
              Final Verification
            </h2>
            <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              All biological, mechanical, and gyroscopic diagnostics have been collected.
              A single authoritative verification request will compile the findings.
            </p>
          </div>

          {/* Privacy disclosure note */}
          <div className="bg-[#080a0d] border border-neutral-800/80 rounded p-3 max-w-md mx-auto text-left font-mono text-[11px] text-neutral-400 space-y-1">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-semibold">Connection Notice:</span>
            </div>
            <p>
              Final verification will send basic connection information to the server.
              That's normal. No passwords, cameras, or microphones are accessed.
            </p>
          </div>

          {/* Verification Button or Loading State */}
          <div className="pt-2">
            {submitting ? (
              <div className="space-y-4 py-4">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="font-mono text-xs text-emerald-400 tracking-wider">
                  {scanStage}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInitiateVerification}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer"
              >
                SUBMIT FINAL VERIFICATION
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Final Revealed Analysis Screen */
        <div className="space-y-6">
          <div className="bg-[#0d1015] border border-neutral-800 rounded-xl p-6 sm:p-8 shadow-2xl relative">
            {/* Top Close Button (Sends Report & Triggers Suspense) */}
            <button
              type="button"
              onClick={() => triggerForwardWithSuspense('close')}
              title="Close and forward verification"
              className="absolute top-5 right-5 p-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="border-b border-neutral-800/80 pb-4 mb-6 pr-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  VERIFICATION COMPLETE // DOSSIER SYNTHESIZED
                </span>
                <h2 className="text-xl sm:text-2xl font-light text-neutral-100 font-sans tracking-tight mt-1">
                  Specimen Assessment Results
                </h2>
              </div>
              <div className="font-mono text-[11px] text-neutral-500">
                REF: {result.verificationId}
              </div>
            </div>

            <div className="space-y-6">
              {/* Part 1: Real Observed Network & Geo Telemetry */}
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Real Observed Network & Location Telemetry</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                  {/* Public IP */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 sm:col-span-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px]">SERVER-OBSERVED PUBLIC IP</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300">
                        {result.network.protocol || 'IPv6'}
                      </span>
                    </div>
                    <span className="text-emerald-400 font-semibold text-xs sm:text-sm font-mono break-all leading-relaxed block mt-1">
                      {result.network.ipAddress}
                    </span>
                    <span className="text-neutral-600 block text-[9px] mt-0.5">
                      Direct HTTP socket / gateway route
                    </span>
                  </div>

                  {/* Geolocation */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                    <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>APPROX. LOCATION</span>
                    </div>
                    <span className="text-neutral-200 font-medium block mt-1 truncate" title={result.network.location}>
                      {result.network.location || 'Regional Zone'}
                    </span>
                    <span className="text-neutral-600 block text-[9px] mt-0.5">
                      We have no intention of visiting
                    </span>
                  </div>

                  {/* ISP / Carrier */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                    <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      <span>NETWORK CARRIER / ISP</span>
                    </div>
                    <span className="text-neutral-200 font-medium block mt-1 truncate" title={result.network.isp}>
                      {result.network.isp || 'Broadband Gateway'}
                    </span>
                    <span className="text-neutral-600 block text-[9px] mt-0.5">
                      Bandwidth expended on this
                    </span>
                  </div>

                  {/* Browser & OS */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px]">BROWSER & SYSTEM</span>
                    <span className="text-neutral-200 font-medium block mt-1">
                      {result.network.browser} ({result.network.os})
                    </span>
                    <span className="text-neutral-600 block text-[9px] mt-0.5">
                      Inferred from User-Agent
                    </span>
                  </div>

                  {/* Display Geometry */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                    <span className="text-neutral-500 block text-[10px]">DISPLAY GEOMETRY</span>
                    <span className="text-neutral-200 font-medium block mt-1">
                      {result.clientData.viewport}
                    </span>
                    <span className="text-neutral-600 block text-[9px] mt-0.5">
                      Timezone: {result.clientData.timezone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Part 2: Hardware & Host Telemetry */}
              {result.hardware && (
                <div>
                  <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Host Hardware & Thermodynamic Telemetry</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                    {/* CPU Cores */}
                    <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                      <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                        <Cpu className="w-3 h-3 text-emerald-400" />
                        <span>PROCESSING LOGIC</span>
                      </div>
                      <span className="text-neutral-200 font-medium block mt-1">
                        {result.hardware.cpuCores}
                      </span>
                      <span className="text-neutral-600 block text-[9px] mt-0.5">
                        All cores calculating this nonsense
                      </span>
                    </div>

                    {/* RAM */}
                    <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[10px]">DEVICE MEMORY</span>
                      <span className="text-neutral-200 font-medium block mt-1">
                        {result.hardware.deviceMemory}
                      </span>
                      <span className="text-neutral-600 block text-[9px] mt-0.5">
                        Capacity adequate; retention dubious
                      </span>
                    </div>

                    {/* Battery */}
                    <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                      <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                        <Battery className="w-3 h-3 text-amber-400" />
                        <span>POWER RESERVES</span>
                      </div>
                      <span className="text-neutral-200 font-medium block mt-1">
                        {result.hardware.batteryStatus}
                      </span>
                      <span className="text-neutral-600 block text-[9px] mt-0.5">
                        Energy expended on science
                      </span>
                    </div>

                    {/* Network Link */}
                    <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80">
                      <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                        <Wifi className="w-3 h-3 text-cyan-400" />
                        <span>DATA TRANSFER LINK</span>
                      </div>
                      <span className="text-neutral-200 font-medium block mt-1">
                        {result.hardware.connectionType}
                      </span>
                      <span className="text-neutral-600 block text-[9px] mt-0.5">
                        High throughput for low-priority tasks
                      </span>
                    </div>

                    {/* Input Mechanism */}
                    <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 sm:col-span-2 md:col-span-2">
                      <div className="flex items-center gap-1 text-neutral-500 text-[10px]">
                        <MousePointer className="w-3 h-3 text-neutral-400" />
                        <span>INPUT PERIPHERAL</span>
                      </div>
                      <span className="text-neutral-200 font-medium block mt-1">
                        {result.hardware.inputMechanism}
                      </span>
                      <span className="text-neutral-600 block text-[9px] mt-0.5">
                        Tactile precision motor control confirmed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Part 3: Theatrical Diagnostics */}
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  <span>Theatrical Evaluations (Satirical Diagnostics)</span>
                </h4>

                <div className="space-y-2.5 font-mono text-xs">
                  {/* Biology */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-neutral-400 text-[11px]">
                        {result.theatricalDiagnostics.biological.label}
                      </span>
                      <p className="text-neutral-500 text-[10px]">
                        {result.theatricalDiagnostics.biological.detail}
                      </p>
                    </div>
                    <span className="text-emerald-400 font-medium self-start sm:self-auto">
                      {result.theatricalDiagnostics.biological.status}
                    </span>
                  </div>

                  {/* Mechanical / Car */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-neutral-400 text-[11px]">
                        {result.theatricalDiagnostics.mechanical.label}
                      </span>
                      <p className="text-neutral-500 text-[10px]">
                        {result.theatricalDiagnostics.mechanical.detail}
                      </p>
                    </div>
                    <span className="text-amber-400 font-medium self-start sm:self-auto">
                      {result.theatricalDiagnostics.mechanical.status}
                    </span>
                  </div>

                  {/* Motorcycle / Bike */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-neutral-400 text-[11px]">
                        {result.theatricalDiagnostics.bike.label}
                      </span>
                      <p className="text-neutral-500 text-[10px]">
                        {result.theatricalDiagnostics.bike.detail}
                      </p>
                    </div>
                    <span className="text-cyan-400 font-medium self-start sm:self-auto">
                      {result.theatricalDiagnostics.bike.status}
                    </span>
                  </div>

                  {/* Hardware MAC Address */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-neutral-400 text-[11px]">
                        {result.theatricalDiagnostics.macAddress.label}
                      </span>
                      <p className="text-neutral-500 text-[10px]">
                        {result.theatricalDiagnostics.macAddress.detail}
                      </p>
                    </div>
                    <span className="text-red-400 font-bold self-start sm:self-auto">
                      {result.theatricalDiagnostics.macAddress.status}
                    </span>
                  </div>

                  {/* Common Sense */}
                  <div className="bg-[#080a0d] p-3 rounded border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="text-neutral-400 text-[11px]">
                        {result.theatricalDiagnostics.commonSense.label}
                      </span>
                      <p className="text-neutral-500 text-[10px]">
                        {result.theatricalDiagnostics.commonSense.detail}
                      </p>
                    </div>
                    <span className="text-neutral-400 italic self-start sm:self-auto">
                      {result.theatricalDiagnostics.commonSense.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* The Comedic Punchline Sequence */}
              <div className="bg-[#07090c] border border-neutral-800 rounded-lg p-6 sm:p-8 text-center space-y-4 font-mono">
                {punchlineStep >= 1 && (
                  <p className="text-lg sm:text-xl font-bold text-neutral-100 tracking-wide transition-opacity duration-500">
                    {result.punchline.primary}
                  </p>
                )}

                {punchlineStep >= 2 && (
                  <p className="text-base text-neutral-300 transition-opacity duration-500">
                    {result.punchline.secondary}
                  </p>
                )}

                {punchlineStep >= 3 && (
                  <p className="text-lg text-emerald-400 font-medium transition-opacity duration-500">
                    {result.punchline.tertiary}
                  </p>
                )}

                {punchlineStep >= 4 && (
                  <p className="text-xs text-neutral-500 pt-3 border-t border-neutral-800/60 max-w-md mx-auto transition-opacity duration-700 leading-relaxed">
                    {result.punchline.closing}
                  </p>
                )}
              </div>
            </div>

            {/* Status message for transmission */}
            {dispatchStatus.message && (
              <div className="mt-6 p-3 rounded bg-emerald-950/40 border border-emerald-500/40 font-mono text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dispatchStatus.message}</span>
              </div>
            )}

            {/* Actions: All 3 Buttons (Close, Submit, Repeat) */}
            <div className="mt-8 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Button 1: Submit Evaluation */}
              <button
                type="button"
                onClick={() => triggerForwardWithSuspense('submit')}
                disabled={dispatchStatus.submitted || !!suspenseModal}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-mono text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/20 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {dispatchStatus.submitted ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Dossier Forwarded to Owner</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Evaluation</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* Button 2: Close Verification */}
                <button
                  type="button"
                  onClick={() => triggerForwardWithSuspense('close')}
                  disabled={!!suspenseModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Close Verification</span>
                </button>

                {/* Button 3: Repeat Evaluation */}
                <button
                  type="button"
                  onClick={() => triggerForwardWithSuspense('repeat')}
                  disabled={!!suspenseModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-transparent hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200 border border-transparent hover:border-neutral-800 font-mono text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repeat Evaluation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
