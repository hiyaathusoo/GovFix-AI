import type { GovernmentServiceMetadata } from "./governmentService";
import type { NormalizedResponse } from "./apiResponse";

export type ConnectorHealthStatus = "healthy" | "degraded" | "unavailable" | "unconfigured";

export interface ConnectorHealthResult {
  serviceId: string;
  serviceName: string;
  category: string;
  status: ConnectorHealthStatus;
  responseTimeMs: number;
  lastChecked: string;
  connectorType: string;
  authStatus: "configured" | "credentials_required" | "sandbox";
}

export interface ConnectorRequestContext {
  serviceId: string;
  requestId: string;
  citizenId: string;
  idempotencyKey: string;
  consentGranted: boolean;
  sanitizedPayload: Record<string, any>;
  timestamp: string;
}

export interface ConnectorExecutionOptions {
  timeoutMs?: number;
  maxRetries?: number;
  simulateFailure?: boolean;
}
