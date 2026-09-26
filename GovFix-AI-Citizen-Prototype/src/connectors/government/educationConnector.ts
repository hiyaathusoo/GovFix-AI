import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class EducationConnector extends BaseGovernmentConnector {
  readonly connectorId = "educationConnector";
  readonly category: ServiceCategory = "education";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Education Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    // 1. Circuit Breaker Check
    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The education service is currently experiencing upstream congestion. GovFix has preserved your request.",
        true,
        "Circuit breaker active"
      );
    }

    // 2. Timeout & Retry Policy
    const { maxRetries, initialBackoffMs, exponential } = service.retryPolicy;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        // Deterministic timeout controller
        const result = await Promise.race([
          this.callEducationApi(serviceId, sanitizedPayload, citizenId),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("GATEWAY_TIMEOUT")), service.timeoutMs)
          ),
        ]);

        this.recordSuccess(serviceId);
        return this.createSuccessResponse(
          serviceId,
          requestId,
          result.status,
          result.data
        );
      } catch (err: any) {
        lastError = err;
        attempt++;
        this.recordFailure(serviceId);

        if (attempt <= maxRetries) {
          const backoff = exponential
            ? initialBackoffMs * Math.pow(2, attempt - 1)
            : initialBackoffMs;
          this.logSafe("warn", `Retrying Education API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    // All retries failed
    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The education service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callEducationApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    // Deterministic network simulation latency (200-400ms)
    await this.sleep(250);

    if (serviceId === "academic-records") {
      return {
        status: "completed",
        data: {
          repository: "DigiLocker / National Academic Depository",
          verifiedStudent: "Arjun Ramesh",
          rollNumber: payload.rollNumber || "2022CS0891",
          recordsFound: [
            { document: "Class 10 Pass Certificate & Marksheet", issuer: "CBSE", year: "2020", status: "Digitally Signed" },
            { document: "Class 12 Pass Certificate & Marksheet", issuer: "CBSE", year: "2022", status: "Digitally Signed" },
          ],
        },
      };
    }

    if (serviceId === "admissions") {
      return {
        status: "processing",
        data: {
          counselingPortal: "Samarth Higher Education / CUET",
          candidateName: "Arjun Ramesh",
          applicationNumber: payload.applicationNumber || "CUET26009841",
          preferenceOrderConfirmed: true,
          nextCounselingRound: "Round 2 — Allotment Announcement on 20 Sep 2026",
        },
      };
    }

    // Default education scheme
    return {
      status: "submitted",
      data: {
        scheme: "State Student Credit Card & Book Grant Scheme",
        acknowledgmentNumber: `EDU-SCC-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "Verification Pending with Institution Nodal Officer",
      },
    };
  }
}
