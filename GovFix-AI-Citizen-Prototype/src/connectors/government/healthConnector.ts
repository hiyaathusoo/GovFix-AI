import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class HealthConnector extends BaseGovernmentConnector {
  readonly connectorId = "healthConnector";
  readonly category: ServiceCategory = "health";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Health Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The national health information exchange is currently experiencing high load. Your request has been safely preserved.",
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
          this.callHealthApi(serviceId, sanitizedPayload, citizenId),
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
          this.logSafe("warn", `Retrying Health API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The health service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callHealthApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    await this.sleep(220);

    if (serviceId === "health-records") {
      return {
        status: "completed",
        data: {
          authority: "National Health Authority (ABDM)",
          abhaAddress: payload.abhaAddressOrNumber || "arjun.ramesh@abdm",
          abhaNumberMasked: "91-8821-••••-4912",
          linkedCareContexts: [
            { clinic: "Victoria General Hospital", type: "General OPD Consultation", date: "14 Jun 2026" },
            { clinic: "City Diagnostics Center", type: "Complete Blood Count (CBC)", date: "02 Aug 2026" },
          ],
          consentStatus: "Explicit Granular Consent Active",
        },
      };
    }

    if (serviceId === "health-schemes") {
      return {
        status: "completed",
        data: {
          scheme: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB PM-JAY)",
          beneficiaryName: "Arjun Ramesh & Family",
          annualCoverageLimit: "₹5,00,000 / Family / Year",
          availableBalance: "₹5,00,000 (No claims against current policy period)",
          ayushmanCardStatus: "Active & Verified",
          empanelledHospitalsInCity: 42,
        },
      };
    }

    // appointments (e-Sanjeevani / OPD)
    return {
      status: "completed",
      data: {
        bookingPortal: "National Teleconsultation Service (e-Sanjeevani) / ORS",
        hospital: "All India Institute of Medical Sciences (AIIMS OPD)",
        department: payload.departmentName || "General Medicine & Health Checkup",
        scheduledDate: payload.appointmentDate || "24 Sep 2026",
        tokenNumber: "OPD-SLOT-042",
        teleconsultationLinkReady: true,
      },
    };
  }
}
