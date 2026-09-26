import type { GovernmentServiceMetadata } from "../types/governmentService";

export class DataMinimizer {
  /**
   * Filters the incoming payload to ONLY contain the explicit required fields
   * declared in the government service registry metadata.
   * Any extraneous citizen profile fields are safely stripped out.
   */
  static filter(
    rawPayload: Record<string, any>,
    requiredFields: string[]
  ): { sanitized: Record<string, any>; strippedKeys: string[] } {
    const sanitized: Record<string, any> = {};
    const strippedKeys: string[] = [];

    const allowedSet = new Set(requiredFields);

    for (const [key, value] of Object.entries(rawPayload)) {
      if (allowedSet.has(key)) {
        sanitized[key] = value;
      } else {
        strippedKeys.push(key);
      }
    }

    return { sanitized, strippedKeys };
  }

  /**
   * Sanitizes any log object to ensure no unmasked Aadhaar, PAN, PIN, OTP,
   * bank account or medical history is written to persistent backend logs.
   */
  static maskForLogs(data: Record<string, any>): Record<string, any> {
    const masked: Record<string, any> = {};

    for (const [key, val] of Object.entries(data)) {
      if (/aadhaar/i.test(key)) {
        masked[key] = "XXXX-XXXX-XXXX";
      } else if (/pan/i.test(key)) {
        masked[key] = "XXXXX••••X";
      } else if (/otp|password|pin|secret|token/i.test(key)) {
        masked[key] = "[REDACTED]";
      } else if (/account|bank|ifsc/i.test(key) && typeof val === "string") {
        masked[key] = `•••• ${val.slice(-4)}`;
      } else if (/medical|diagnosis/i.test(key)) {
        masked[key] = "[CONFIDENTIAL_HEALTH_DATA]";
      } else {
        masked[key] = val;
      }
    }

    return masked;
  }
}
