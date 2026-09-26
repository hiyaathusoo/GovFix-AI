import type { GovernmentConnector } from "./connector.interface";
import type { GovernmentServiceMetadata, ServiceCategory } from "../../types/governmentService";
import type { NormalizedResponse, NormalizedSuccessResponse, NormalizedErrorResponse } from "../../types/apiResponse";
import type { ConnectorHealthResult, ConnectorRequestContext } from "../../types/connector";

interface CircuitBreakerState {
  failureCount: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export abstract class BaseGovernmentConnector implements GovernmentConnector {
  abstract readonly connectorId: string;
  abstract readonly category: ServiceCategory;

  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private readonly FAILURE_THRESHOLD = 3;
  private readonly CIRCUIT_RESET_MS = 30000; // 30 seconds

  /**
   * Safe logger: Never logs sensitive citizen values (Aadhaar, PAN, OTP, tokens, bank info).
   */
  protected logSafe(level: "info" | "warn" | "error", message: string, metadata?: Record<string, any>) {
    const sanitizedMeta: Record<string, any> = {};
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        if (/aadhaar|pan|otp|password|token|secret|cvv|bank|account|medical/i.test(key)) {
          sanitizedMeta[key] = "[REDACTED]";
        } else if (typeof value === "string" && value.length > 8 && /citizen|user|id/i.test(key)) {
          sanitizedMeta[key] = `${value.slice(0, 3)}***${value.slice(-3)}`;
        } else {
          sanitizedMeta[key] = value;
        }
      }
    }
    // Backend console log with timestamp
    const time = new Date().toISOString();
    console.log(`[GovFix-Connector][${time}][${this.connectorId}][${level.toUpperCase()}] ${message}`, sanitizedMeta);
  }

  /**
   * Deterministic circuit breaker check
   */
  protected isCircuitOpen(serviceId: string): boolean {
    const cb = this.circuitBreakers.get(serviceId);
    if (!cb) return false;

    if (cb.isOpen) {
      const elapsed = Date.now() - cb.lastFailureTime;
      if (elapsed > this.CIRCUIT_RESET_MS) {
        // Half-open: try again
        cb.isOpen = false;
        cb.failureCount = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  protected recordSuccess(serviceId: string) {
    const cb = this.circuitBreakers.get(serviceId);
    if (cb) {
      cb.failureCount = 0;
      cb.isOpen = false;
    }
  }

  protected recordFailure(serviceId: string) {
    let cb = this.circuitBreakers.get(serviceId);
    if (!cb) {
      cb = { failureCount: 1, lastFailureTime: Date.now(), isOpen: false };
      this.circuitBreakers.set(serviceId, cb);
    } else {
      cb.failureCount += 1;
      cb.lastFailureTime = Date.now();
      if (cb.failureCount >= this.FAILURE_THRESHOLD) {
        cb.isOpen = true;
        this.logSafe("warn", `Circuit breaker tripped for service`, { serviceId, failureCount: cb.failureCount });
      }
    }
  }

  /**
   * Deterministic delay for exponential backoff
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Normalized Success Builder
   */
  protected createSuccessResponse<T>(
    serviceId: string,
    requestId: string,
    status: "submitted" | "completed" | "processing" | "queued",
    data: T
  ): NormalizedSuccessResponse<T> {
    return {
      success: true,
      serviceId,
      requestId,
      timestamp: new Date().toISOString(),
      status,
      data,
      error: null,
    };
  }

  /**
   * Normalized Error Builder
   */
  protected createErrorResponse(
    serviceId: string,
    requestId: string,
    code: string,
    message: string,
    retryable = false,
    details?: string
  ): NormalizedErrorResponse {
    return {
      success: false,
      serviceId,
      requestId,
      timestamp: new Date().toISOString(),
      error: {
        code,
        message,
        retryable,
        details,
      },
    };
  }

  /**
   * Default Health Check Implementation
   */
  async checkHealth(service: GovernmentServiceMetadata): Promise<ConnectorHealthResult> {
    const start = Date.now();
    const isAvailable = service.status === "Sandbox" || service.status === "Connected" || service.status === "Available";

    let authStatus: "configured" | "credentials_required" | "sandbox" = "sandbox";
    if (service.authMethod === "oauth2" || service.authMethod === "api_key") {
      authStatus = "credentials_required";
    }

    return {
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      category: this.category,
      status: isAvailable ? "healthy" : "unconfigured",
      responseTimeMs: Math.max(15, Date.now() - start),
      lastChecked: new Date().toISOString(),
      connectorType: this.connectorId,
      authStatus,
    };
  }

  /**
   * Abstract execution method implemented by domain connectors
   */
  abstract executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse>;
}
