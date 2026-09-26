import { BaseGovernmentConnector } from "./baseConnector";
import type { ServiceCategory, GovernmentServiceMetadata } from "../../types/governmentService";
import type { NormalizedResponse } from "../../types/apiResponse";
import type { ConnectorRequestContext } from "../../types/connector";

export class FinanceConnector extends BaseGovernmentConnector {
  readonly connectorId = "financeConnector";
  readonly category: ServiceCategory = "finance";

  async executeRequest(
    context: ConnectorRequestContext,
    service: GovernmentServiceMetadata
  ): Promise<NormalizedResponse> {
    const { serviceId, requestId, citizenId, sanitizedPayload } = context;

    this.logSafe("info", `Executing Finance Connector request for ${serviceId}`, {
      serviceId,
      citizenId,
      requestId,
    });

    if (this.isCircuitOpen(serviceId)) {
      return this.createErrorResponse(
        serviceId,
        requestId,
        "CIRCUIT_OPEN",
        "The financial taxation portal is currently undergoing scheduled batch reconciliation. Your request has been securely saved.",
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
          this.callFinanceApi(serviceId, sanitizedPayload, citizenId),
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
          this.logSafe("warn", `Retrying Finance API call`, { serviceId, attempt, backoffMs: backoff });
          await this.sleep(backoff);
        }
      }
    }

    return this.createErrorResponse(
      serviceId,
      requestId,
      lastError?.message === "GATEWAY_TIMEOUT" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_UNAVAILABLE",
      "The financial service is temporarily unavailable. Your request has been safely saved.",
      true,
      lastError?.message
    );
  }

  private async callFinanceApi(
    serviceId: string,
    payload: Record<string, any>,
    citizenId: string
  ): Promise<{ status: "submitted" | "completed" | "processing" | "queued"; data: any }> {
    await this.sleep(240);

    if (serviceId === "income-tax") {
      return {
        status: "processing",
        data: {
          authority: "Income Tax Department, Directorate of Systems",
          assessmentYear: payload.assessmentYear || "AY 2025-26",
          panMasked: payload.panMasked || "ABCDE••••F",
          formType: "ITR-1 (Sahaj)",
          acknowledgmentNumber: "e-ITR-992014819",
          filingDate: "12 Jul 2026",
          eVerificationStatus: "e-Verified via Aadhaar OTP",
          refundStatus: "Refund of ₹8,420 credited via NECS/DBT on 28 Aug 2026",
        },
      };
    }

    if (serviceId === "property-tax") {
      return {
        status: "completed",
        data: {
          municipality: "Bruhat Bengaluru Mahanagara Palike (BBMP)",
          propertyIdSAS: payload.propertyIdOrSAS || "PID-108-94-22",
          wardName: "Indiranagar (Ward 112)",
          annualAssessmentYear: "2026-27",
          totalAssessedTax: "₹4,120.00",
          rebateApplied: "5% Early Bird Incentive Applied",
          receiptNumber: "BBMP-SAS-2026-881924",
          taxStatus: "Paid in Full · Digital Receipt Verified",
        },
      };
    }

    if (serviceId === "pension") {
      return {
        status: "completed",
        data: {
          regulator: "PFRDA / Central Recordkeeping Agency (Protean CRA)",
          pranNumber: payload.pranNumber || "1100 •••• 9284",
          subscriberName: "Arjun Ramesh",
          tier1CurrentValuation: "₹3,48,200.00",
          digitalLifeCertificateStatus: "Jeevan Pramaan Verified (Valid till Nov 2026)",
          linkedDbtBank: "State Bank of India",
        },
      };
    }

    // other-finance
    return {
      status: "completed",
      data: {
        scheme: "Direct Benefit Transfer & Interest Subvention Registry",
        accountStatus: "Seeded with NPCI Aadhaar Mapper",
        eligibleSubsidies: ["LPG PAHAL Subsidy", "Education Welfare DBT"],
      },
    };
  }
}
