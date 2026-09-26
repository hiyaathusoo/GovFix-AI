import type { GovernmentServiceMetadata, ServiceCategory } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorHealthResult, ConnectorRequestContext } from "../../types/connector";

export interface GovernmentConnector {
  readonly connectorId: string;
  readonly category: ServiceCategory;

  /**
   * Health-check mechanism for this connector and its registered service.
   * Deterministically verifies connectivity, credential status, or sandbox response.
   */
  checkHealth(service: GovernmentServiceMetadata): Promise<ConnectorHealthResult>;

  /**
   * Execute a citizen request against the government service.
   * Handles timeouts, retries, idempotency, circuit breaking, and response normalization.
   */
  executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse>;
}
