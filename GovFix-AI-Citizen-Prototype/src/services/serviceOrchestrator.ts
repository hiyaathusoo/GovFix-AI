import { getServiceById } from "../config/governmentServices";
import { connectorRegistry } from "../connectors/government/connectorRegistry";
import { consentService } from "./consentService";
import { DataMinimizer } from "./dataMinimization";
import type { NormalizedResponse } from "../types/apiResponse";
import type { ConnectorRequestContext } from "../types/connector";

export interface ServiceRequestInput {
  serviceId: string;
  citizenId: string;
  consentGranted: boolean;
  payload: Record<string, any>;
  idempotencyKey?: string;
}

interface IdempotencyRecord {
  requestId: string;
  timestamp: string;
  response: NormalizedResponse;
}

class ServiceOrchestrator {
  private idempotencyStore = new Map<string, IdempotencyRecord>();
  private readonly IDEMPOTENCY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  private makeIdempotencyKey(citizenId: string, serviceId: string, key?: string): string {
    return `${citizenId}::${serviceId}::${key || "default_submission"}`;
  }

  async handleRequest(input: ServiceRequestInput): Promise<NormalizedResponse> {
    const { serviceId, citizenId, consentGranted, payload } = input;
    const requestId = `REQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 1. Identify Service in Registry
    const service = getServiceById(serviceId);
    if (!service) {
      return {
        success: false,
        serviceId,
        requestId,
        timestamp: new Date().toISOString(),
        error: {
          code: "SERVICE_NOT_FOUND",
          message: `Government service '${serviceId}' is not registered in the GovFix directory.`,
          retryable: false,
        },
      };
    }

    // 2. Validate Citizen Consent
    if (!consentGranted && !consentService.hasConsent(citizenId, serviceId)) {
      return {
        success: false,
        serviceId,
        requestId,
        timestamp: new Date().toISOString(),
        error: {
          code: "CONSENT_REQUIRED",
          message: "GovFix requires your explicit permission to transmit required data to this government department.",
          retryable: false,
          details: service.requiredCitizenConsent.purpose,
        },
      };
    }

    // Record consent in audit store
    consentService.recordConsent(
      citizenId,
      serviceId,
      service.requiredCitizenConsent.recipientDepartment,
      service.requiredFields
    );

    // 3. Check Idempotency & Duplicate Prevention
    const idempotencyLookupKey = this.makeIdempotencyKey(citizenId, serviceId, input.idempotencyKey);
    const existing = this.idempotencyStore.get(idempotencyLookupKey);
    if (existing) {
      const elapsed = Date.now() - new Date(existing.timestamp).getTime();
      if (elapsed < this.IDEMPOTENCY_WINDOW_MS) {
        console.log(`[GovFix-Orchestrator] Duplicate submission prevented for ${idempotencyLookupKey}. Returning cached state.`);
        return {
          ...existing.response,
          requestId: existing.requestId, // retain original application request ID
        };
      }
    }

    // 4. Data Minimization: Filter only required fields
    const { sanitized, strippedKeys } = DataMinimizer.filter(payload, service.requiredFields);
    if (strippedKeys.length > 0) {
      console.log(
        `[GovFix-Orchestrator] Data minimization active. Stripped ${strippedKeys.length} unrequested fields:`,
        strippedKeys
      );
    }

    // 5. Select Designated Connector
    const connector = connectorRegistry.get(service.connectorType);
    if (!connector) {
      return {
        success: false,
        serviceId,
        requestId,
        timestamp: new Date().toISOString(),
        error: {
          code: "CONNECTOR_NOT_FOUND",
          message: `No active connector configured for connector type '${service.connectorType}'.`,
          retryable: false,
        },
      };
    }

    // 6. Build Request Context
    const context: ConnectorRequestContext = {
      serviceId,
      requestId,
      citizenId,
      idempotencyKey: idempotencyLookupKey,
      consentGranted: true,
      sanitizedPayload: sanitized,
      timestamp: new Date().toISOString(),
    };

    // 7. Execute Connector via Gateway
    const response = await connector.executeRequest(context, service);

    // 8. Store in Idempotency Cache if successful or preserved
    if (response.success || response.error.retryable) {
      this.idempotencyStore.set(idempotencyLookupKey, {
        requestId,
        timestamp: new Date().toISOString(),
        response,
      });
    }

    return response;
  }
}

export const serviceOrchestrator = new ServiceOrchestrator();
