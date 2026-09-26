import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class CitizenServicesConnector extends BaseGovernmentConnector {
  readonly connectorId = "citizenServicesConnector";
  readonly category: ServiceCategory = "services";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Citizen Services Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The citizen services registry is currently experiencing heavy load. Your request has been safely saved.",
        true,
        "Circuit breaker active"
      );
    }

    const { maxRetries, initialBackoffMs, exponential } = service.retryPolicy;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      try {
        const result = await Promise.race([
          this.callCitizenServicesApi(serviceId, sanitizedPayload, citizenId),
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
          this.logSafe("warn", `Retrying Citizen Services API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The citizen service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callCitizenServicesApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    await this.sleep(220);

    if (serviceId === "certificates") {
      const certId = `REV-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        status: "processing",
        data: {
          issuingAuthority: "State Revenue Department (Tahsildar Office)",
          applicationReference: certId,
          certificateType: payload.certificateType || "Income & Domicile Certificate",
          applicantName: payload.applicantName || "Arjun Ramesh",
          estimatedProcessingDays: "3 working days",
          trackingStatus: "Submitted to Revenue Inspector for Taluk Verification",
        },
      };
    }

    if (serviceId === "citizen-schemes") {
      return {
        status: "completed",
        data: {
          schemeRegistry: "Public Distribution & Direct Benefit Schemes",
          rationCardStatus: "Active — NFSA Priority Household (One Nation One Ration)",
          fairPriceShop: "FPS #42, Indiranagar",
          monthlyEntitlement: "Foodgrain quota authenticated and verified",
        },
      };
    }

    // identity-services
    return {
      status: "completed",
      data: {
        authority: "UIDAI / National Identity Registry",
        identityStatus: "e-KYC Verified & Aadhaar Active",
        panAadhaarLinking: "Linked and Operational",
        voterIdStatus: "Registered in Bengaluru Central Parliamentary Constituency",
        biometricLock: "Unlocked by Citizen for GovFix Authenticated Session",
      },
    };
  }
}
