import { getAllRegisteredServices, getServiceById } from "../config/governmentServices";
import { connectorRegistry } from "../connectors/government/connectorRegistry";
import { serviceOrchestrator, type ServiceRequestInput } from "./serviceOrchestrator";
import type { ConnectorHealthResult } from "../types/connector";
import type { NormalizedResponse } from "../types/apiResponse";
import { gatewayRequestQueue } from "./requestQueue";

export class ApiGateway {
  /**
   * Health-check handler for GET /api/connectors/health
   * Verifies health for each registered service connector.
   */
  async getConnectorsHealth(): Promise<ConnectorHealthResult[]> {
    const services = getAllRegisteredServices();
    const results: ConnectorHealthResult[] = [];

    for (const service of services) {
      const connector = connectorRegistry.get(service.connectorType);
      if (connector) {
        try {
          const health = await connector.checkHealth(service);
          results.push(health);
        } catch (err: any) {
          results.push({
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            category: service.category,
            status: "unavailable",
            responseTimeMs: 0,
            lastChecked: new Date().toISOString(),
            connectorType: service.connectorType,
            authStatus: "credentials_required",
          });
        }
      }
    }

    return results;
  }

  /**
   * Request dispatcher for POST /api/services/:serviceId/request
   */
  async dispatchServiceRequest(input: ServiceRequestInput): Promise<NormalizedResponse> {
    return serviceOrchestrator.handleRequest(input);
  }
}

export const apiGateway = new ApiGateway();

/**
 * Frontend Client Helper:
 * Sends requests to the backend /api/services/:serviceId/request endpoint.
 * In a browser environment, this makes an HTTP POST request to the server.
 * If the server responds with normalized JSON, it returns it directly.
 * Fallback to in-process orchestrator if running in a standalone preview without server.
 */
export async function dispatchCitizenServiceRequest(
  serviceId: string,
  citizenId: string,
  payload: Record<string, any>,
  consentGranted: boolean,
  idempotencyKey?: string
): Promise<NormalizedResponse> {
  const requestBody: ServiceRequestInput = {
    serviceId,
    citizenId,
    consentGranted,
    payload,
    idempotencyKey,
  };

  return gatewayRequestQueue.enqueue(async () => {
    try {
      const response = await fetch(`/api/services/${serviceId}/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        return (await response.json()) as NormalizedResponse;
      }

      try {
        const errorJson = await response.json();
        return errorJson as NormalizedResponse;
      } catch {
        return {
          success: false,
          serviceId,
          requestId: `ERR-${Date.now()}`,
          timestamp: new Date().toISOString(),
          error: {
            code: `HTTP_${response.status}`,
            message: "The government service gateway returned an unexpected response.",
            retryable: true,
          },
        };
      }
    } catch (networkError: unknown) {
      console.warn("[GovFix-Client] Fetch to /api/services failed, using local orchestrator fallback:", networkError);
      return serviceOrchestrator.handleRequest(requestBody);
    }
  }, 0);
}

export { gatewayRequestQueue };

/**
 * Frontend Client Helper for Health Check
 */
export async function fetchConnectorsHealth(): Promise<ConnectorHealthResult[]> {
  try {
    const response = await fetch("/api/connectors/health");
    if (response.ok) {
      return (await response.json()) as ConnectorHealthResult[];
    }
    return apiGateway.getConnectorsHealth();
  } catch {
    return apiGateway.getConnectorsHealth();
  }
}
