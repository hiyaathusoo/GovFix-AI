import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class TransportConnector extends BaseGovernmentConnector {
  readonly connectorId = "transportConnector";
  readonly category: ServiceCategory = "transport";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Transport Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The transport portal is currently experiencing high load. Your request has been safely saved.",
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
          this.callTransportApi(serviceId, sanitizedPayload, citizenId),
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
          this.logSafe("warn", `Retrying Transport API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The transport service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callTransportApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    await this.sleep(220);

    if (serviceId === "driving-licence") {
      return {
        status: "processing",
        data: {
          portal: "Sarathi Parivahan (MoRTH)",
          licenceNumber: payload.licenceNumber || "KA-01-2016-0038912",
          holderName: "Arjun Ramesh",
          validTill: "14 May 2031",
          classesOfVehicles: ["MCWG (Motor Cycle with Gear)", "LMV (Light Motor Vehicle)"],
          rtoOffice: "KA-01 (Bengaluru Central)",
          serviceRequested: "Address Update & Smart Card Re-issuance",
          applicationStatus: "Demographic e-KYC verified with Aadhaar",
        },
      };
    }

    if (serviceId === "vehicle-registration") {
      return {
        status: "completed",
        data: {
          portal: "Vahan 4.0 National Register",
          registrationNumber: payload.registrationNumber || "KA-05-NB-4482",
          ownerName: "Arjun Ramesh",
          vehicleClass: "Two Wheeler (Non-Transport)",
          fuelType: "Electric",
          pollutionFitnessValidTill: "18 Aug 2028",
          insuranceValidTill: "12 Oct 2027",
          roadTaxStatus: "Life Time Paid",
        },
      };
    }

    if (serviceId === "traffic-challan") {
      return {
        status: "completed",
        data: {
          portal: "MoRTH e-Challan Citizen Gateway",
          queryIdentifier: payload.vehicleOrChallanNumber || "KA-05-NB-4482",
          pendingChallansCount: 0,
          totalOutstandingAmount: "₹0.00",
          status: "No outstanding traffic violations found. Records are clear.",
          lastVerifiedTimestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      };
    }

    // public-transport
    return {
      status: "completed",
      data: {
        network: "National Common Mobility Card (NCMC) / Metro Transit",
        cardNumber: payload.cardNumber || "•••• •••• •••• 9924",
        balance: "₹480.00",
        monthlyPassStatus: "Active (Bengaluru Metro Purple & Green Line)",
        validTill: "30 Sep 2026",
      },
    };
  }
}
