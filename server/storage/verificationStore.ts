export interface VerificationRecord {
  id: string;
  createdAt: string;
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
  language: string;
  timezone: string;
  screenWidth: number;
  screenHeight: number;
  interactionCount: number;
  discoveredSecrets: string[];
}

export interface OwnerDispatch {
  dispatchId: string;
  dispatchedAt: string;
  triggerButton: 'submit' | 'close' | 'repeat';
  ownerRecipient: string;
  status: 'transmitted' | 'logged';
  verificationId: string;
  dossierSummary: Record<string, unknown>;
}

class VerificationStore {
  private records: VerificationRecord[] = [];
  private dispatches: OwnerDispatch[] = [];

  public save(record: Omit<VerificationRecord, 'id' | 'createdAt'>): VerificationRecord {
    const newRecord: VerificationRecord = {
      ...record,
      id: `diag-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.records.unshift(newRecord);
    // Keep max 100 in memory
    if (this.records.length > 100) {
      this.records = this.records.slice(0, 100);
    }
    return newRecord;
  }

  public dispatchToOwner(
    triggerButton: 'submit' | 'close' | 'repeat',
    verificationId: string,
    dossierSummary: Record<string, unknown>
  ): OwnerDispatch {
    const dispatch: OwnerDispatch = {
      dispatchId: `disp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`,
      dispatchedAt: new Date().toISOString(),
      triggerButton,
      ownerRecipient: '[CLASSIFIED_DISPATCH_GATEWAY]',
      status: 'transmitted',
      verificationId,
      dossierSummary,
    };
    this.dispatches.unshift(dispatch);
    if (this.dispatches.length > 100) {
      this.dispatches = this.dispatches.slice(0, 100);
    }
    console.log(
      `[TELEMETRY DISPATCH] Dispatched report [ID: ${verificationId}] to central admin gateway via button: [${triggerButton}]`
    );
    return dispatch;
  }

  public getDispatches(): OwnerDispatch[] {
    return this.dispatches;
  }

  public getLatest(): VerificationRecord | null {
    return this.records[0] || null;
  }

  public getCount(): number {
    return this.records.length;
  }
}

export const verificationStore = new VerificationStore();

