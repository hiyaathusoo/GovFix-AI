export interface ConsentRecord {
  citizenId: string;
  serviceId: string;
  recipientDepartment: string;
  grantedAt: string;
  permittedFields: string[];
}

class ConsentService {
  private consentStore = new Map<string, ConsentRecord>();

  private makeKey(citizenId: string, serviceId: string): string {
    return `${citizenId}::${serviceId}`;
  }

  recordConsent(
    citizenId: string,
    serviceId: string,
    recipientDepartment: string,
    permittedFields: string[]
  ): ConsentRecord {
    const record: ConsentRecord = {
      citizenId,
      serviceId,
      recipientDepartment,
      grantedAt: new Date().toISOString(),
      permittedFields,
    };
    this.consentStore.set(this.makeKey(citizenId, serviceId), record);
    return record;
  }

  hasConsent(citizenId: string, serviceId: string): boolean {
    return this.consentStore.has(this.makeKey(citizenId, serviceId));
  }

  getConsent(citizenId: string, serviceId: string): ConsentRecord | undefined {
    return this.consentStore.get(this.makeKey(citizenId, serviceId));
  }

  revokeConsent(citizenId: string, serviceId: string): boolean {
    return this.consentStore.delete(this.makeKey(citizenId, serviceId));
  }
}

export const consentService = new ConsentService();
