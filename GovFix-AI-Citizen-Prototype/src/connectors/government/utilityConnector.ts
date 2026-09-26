import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class UtilityConnector extends BaseGovernmentConnector {
  readonly connectorId = "utilityConnector";
  readonly category: ServiceCategory = "utilities";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Utility Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The utility billing grid is temporarily congested. Your transaction has been securely held.",
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
          this.callUtilityApi(serviceId, sanitizedPayload, citizenId),
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
          this.logSafe("warn", `Retrying Utility API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The utility service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callUtilityApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    await this.sleep(200);

    if (serviceId === "electricity-bill") {
      return {
        status: "completed",
        data: {
          discom: "State Electricity Distribution Company (BESCOM)",
          consumerAccountId: payload.consumerId || "BES-9821044",
          registeredAddress: "Indiranagar 1st Stage, Bengaluru",
          billingCycle: "August 2026",
          unitsConsumed: "184 kWh",
          subsidizedUnits: "184 kWh (Govt Zero-Bill Scheme Applied)",
          netAmountPayable: "₹0.00",
          dueDate: "28 Sep 2026",
          status: "Paid / Subsidized Account in Good Standing",
        },
      };
    }

    if (serviceId === "water-bill") {
      return {
        status: "completed",
        data: {
          waterBoard: "Bangalore Water Supply & Sewerage Board (BWSSB)",
          connectionNumber: payload.connectionNumber || "BW-4091-B",
          meterReadingCurrent: "842 kL",
          currentBillAmount: "₹340.00",
          paymentStatus: "Payment cleared on 04 Sep 2026",
          waterQualityReport: "Potable / Compliant with IS 10500:2012 Standards",
        },
      };
    }

    // gas-services
    return {
      status: "completed",
      data: {
        provider: "Oil Marketing Company (Indane LPG)",
        lpgConsumerId: payload.lpgId17Digit || "2891 •••• •••• 4410",
        cylinderBookingStatus: "Refill Delivered on 02 Sep 2026",
        subsidyTransferred: "₹248.50 credited via DBT to linked account",
        nextEligibleBookingDate: "22 Sep 2026",
      },
    };
  }
}
