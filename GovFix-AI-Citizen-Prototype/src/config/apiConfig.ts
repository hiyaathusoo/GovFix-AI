/**
 * Backend API Configuration
 *
 * NOTE: This module is intended for backend execution only.
 * Government API keys, client secrets, and sensitive tokens are read here
 * and MUST NEVER be sent or exposed to the client browser.
 */

export interface GovApiEnvironmentConfig {
  baseUrl: string;
  apiKey: string;
  clientId: string;
  clientSecret: string;
  environment: "development" | "staging" | "production";
  isConfigured: boolean;
}

export function getGovApiConfig(envVarPrefix = "GOV_API"): GovApiEnvironmentConfig {
  const env = typeof process !== "undefined" && process.env ? process.env : {};

  const baseUrl = env[`${envVarPrefix}_BASE_URL`] || env.GOV_API_BASE_URL || "https://sandbox-api.govservices.gov.in/v1";
  const apiKey = env[`${envVarPrefix}_KEY`] || env.GOV_API_KEY || "";
  const clientId = env[`${envVarPrefix}_CLIENT_ID`] || env.GOV_API_CLIENT_ID || "";
  const clientSecret = env[`${envVarPrefix}_CLIENT_SECRET`] || env.GOV_API_CLIENT_SECRET || "";
  const environment = (env.GOV_API_ENV as "development" | "staging" | "production") || "development";

  const isConfigured = Boolean(apiKey || (clientId && clientSecret));

  return {
    baseUrl,
    apiKey,
    clientId,
    clientSecret,
    environment,
    isConfigured,
  };
}

export function getServiceEndpointUrl(baseUrlEnvVar: string, path: string): string {
  const env = typeof process !== "undefined" && process.env ? process.env : {};
  const baseUrl = env[baseUrlEnvVar] || env.GOV_API_BASE_URL || "https://sandbox-api.govservices.gov.in/v1";
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
