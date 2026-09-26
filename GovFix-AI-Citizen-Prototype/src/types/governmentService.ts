export type ServiceCategory =
  | "education"
  | "transport"
  | "utilities"
  | "finance"
  | "health"
  | "services";

export type ServiceStatus =
  | "Connected"
  | "Available"
  | "Requires Authorization"
  | "Sandbox"
  | "Connector Configured"
  | "Coming Soon";

export type ApiAvailability =
  | "public_documented"
  | "restricted_credentials"
  | "sandbox_only"
  | "planned";

export type AuthMethod =
  | "oauth2"
  | "api_key"
  | "dbt_token"
  | "mutual_tls"
  | "sandbox"
  | "none";

export interface CitizenConsentRequirement {
  title: string;
  purpose: string;
  recipientDepartment: string;
  legalBasis?: string;
}

export interface RetryPolicy {
  maxRetries: number;
  initialBackoffMs: number;
  exponential: boolean;
}

export interface GovernmentServiceMetadata {
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  provider: string;
  description: string;
  apiAvailability: ApiAvailability;
  connectorType: string;
  endpointConfig: {
    baseUrlEnvVar: string;
    path: string;
    method: "GET" | "POST" | "PUT";
  };
  authMethod: AuthMethod;
  requiredCitizenConsent: CitizenConsentRequirement;
  requiredFields: string[];
  supportedOperations: string[];
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  status: ServiceStatus;
}
