import type { Plugin, ViteDevServer } from "vite";
import { apiGateway } from "../services/apiGateway";
import { getAllRegisteredServices } from "../config/governmentServices";
import { gatewayRequestQueue } from "../services/requestQueue";
import {
  findCitizen,
  dispatchOtp,
  verifyOtpCode,
  registerCitizen,
  invalidateSession,
  getSessionCitizen,
  refreshSessionToken,
  maskMobile,
  normalizeMobile,
} from "./authBackend";
import {
  getMockApplication,
  getMockApplications,
  getMockHealth,
  mockDocuments,
  mockEligibility,
  mockIdentity,
  mockIncome,
  submitMockApplication,
} from "../services/mockGovernmentWorkflow";
import {
  getErpApplication,
  getErpApplications,
  getErpHealth,
  registerErpApplication,
  updateErpApplication,
} from "../services/mockErp";

function readRequestBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let bodyData = "";
    req.on("data", (chunk: any) => {
      bodyData += chunk;
    });
    req.on("end", () => {
      try {
        resolve(bodyData ? JSON.parse(bodyData) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export function govFixApiBackendPlugin(): Plugin {
  return {
    name: "govfix-api-backend",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        const [pathname, queryString] = url.split("?");

        // ====================================================================
        // BACKEND AUTHENTICATION API (Sections 13, 14, 21)
        // ====================================================================

        // POST /api/auth/login
        if (req.method === "POST" && pathname === "/api/auth/login") {
          const body = await readRequestBody(req);
          const identifier = body.citizenId || body.mobile || body.identifier || "";
          const trimmed = identifier.trim();

          const citizen = findCitizen(trimmed);
          if (citizen) {
            const otpRes = dispatchOtp(citizen.citizenId, "MFA");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                success: true,
                requiresMfa: true,
                isNewCitizen: false,
                citizenId: citizen.citizenId,
                maskedMobile: maskMobile(citizen.mobile),
                demoOtp: otpRes.demoOtp,
                message: `MFA verification code dispatched to ${maskMobile(citizen.mobile)}`,
              })
            );
            return;
          }

          // If identifier is a 10-digit mobile number, treat as new citizen registration
          const normMob = normalizeMobile(trimmed);
          if (normMob && normMob.length === 10) {
            const otpRes = dispatchOtp(normMob, "REGISTER");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                success: true,
                requiresMfa: true,
                isNewCitizen: true,
                maskedMobile: maskMobile(normMob),
                demoOtp: otpRes.demoOtp,
                message: `Verification code sent to ${maskMobile(normMob)}`,
              })
            );
            return;
          }

          // Unrecognized citizen ID
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(
            JSON.stringify({
              success: false,
              error: "CITIZEN_NOT_FOUND",
              message: "Citizen ID not found. Please verify your reference or register as a new citizen.",
            })
          );
          return;
        }

        // POST /api/auth/send-otp
        if (req.method === "POST" && pathname === "/api/auth/send-otp") {
          const body = await readRequestBody(req);
          const identifier = body.mobile || body.citizenId || body.identifier || "";
          const purpose = body.purpose || "LOGIN";
          const result = dispatchOtp(identifier, purpose);
          res.statusCode = result.success ? 200 : 429;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // POST /api/auth/verify-otp
        if (req.method === "POST" && pathname === "/api/auth/verify-otp") {
          const body = await readRequestBody(req);
          const identifier = body.identifier || body.mobile || body.citizenId || "";
          const otp = body.otp || "";
          const result = verifyOtpCode(identifier, otp);
          res.statusCode = result.success ? 200 : 400;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // POST /api/auth/register
        if (req.method === "POST" && pathname === "/api/auth/register") {
          const body = await readRequestBody(req);
          const result = registerCitizen(body);
          res.statusCode = result.success ? 201 : 400;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // POST /api/auth/logout
        if (req.method === "POST" && pathname === "/api/auth/logout") {
          const authHeader = req.headers["authorization"] || "";
          const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, "");
          const body = await readRequestBody(req);
          const token = tokenFromHeader || body.token || "";
          const result = invalidateSession(token);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // GET /api/auth/me
        if (req.method === "GET" && pathname === "/api/auth/me") {
          const authHeader = req.headers["authorization"] || "";
          const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, "");
          const tokenFromQuery = new URLSearchParams(queryString || "").get("token") || "";
          const token = tokenFromHeader || tokenFromQuery;
          const result = getSessionCitizen(token);
          res.statusCode = result.success ? 200 : 401;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // POST /api/auth/refresh
        if (req.method === "POST" && pathname === "/api/auth/refresh") {
          const authHeader = req.headers["authorization"] || "";
          const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, "");
          const body = await readRequestBody(req);
          const token = tokenFromHeader || body.token || "";
          const result = refreshSessionToken(token);
          res.statusCode = result.success ? 200 : 401;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(result, null, 2));
          return;
        }

        // 1. GET /api/connectors/health
        if (req.method === "GET" && pathname === "/api/connectors/health") {
          try {
            const healthResults = await apiGateway.getConnectorsHealth();
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(healthResults, null, 2));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: err?.message || "Health check failure" }));
          }
          return;
        }

        // 1b. GET /api/gateway/queue
        if (req.method === "GET" && pathname === "/api/gateway/queue") {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(gatewayRequestQueue.snapshot(), null, 2));
          return;
        }

        // 1c. GET /api/services/health
        if (req.method === "GET" && pathname === "/api/services/health") {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(getMockHealth(), null, 2));
          return;
        }

        // 1d. Mock departmental ERP endpoints.
        if (req.method === "GET" && pathname === "/api/erp/health") {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(getErpHealth(), null, 2));
          return;
        }

        if (req.method === "GET" && pathname === "/api/erp/applications") {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(getErpApplications(), null, 2));
          return;
        }

        const erpApplicationMatch = pathname.match(/^\/api\/erp\/applications\/([^/]+)$/);
        if (req.method === "GET" && erpApplicationMatch) {
          const application = getErpApplication(erpApplicationMatch[1]);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          if (!application) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "ERP_APPLICATION_NOT_FOUND" }));
          } else {
            res.end(JSON.stringify(application, null, 2));
          }
          return;
        }

        if (req.method === "PUT" && erpApplicationMatch) {
          let bodyData = "";
          req.on("data", (chunk) => {
            bodyData += chunk;
          });
          req.on("end", () => {
            const body = bodyData ? JSON.parse(bodyData) : {};
            const application = updateErpApplication(
              erpApplicationMatch[1],
              body.status,
              body.officerNote
            );
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            if (!application) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "ERP_APPLICATION_NOT_FOUND" }));
            } else {
              res.end(JSON.stringify(application, null, 2));
            }
          });
          return;
        }

        // 1e. Mock government APIs used by the workflow demonstration.
        const identityMatch = pathname.match(/^\/api\/identity\/verify\/([^/]+)$/);
        const incomeMatch = pathname.match(/^\/api\/income\/verify\/([^/]+)$/);
        const eligibilityMatch = pathname.match(/^\/api\/eligibility\/check\/([^/]+)$/);
        if (req.method === "GET" && (identityMatch || incomeMatch || eligibilityMatch)) {
          const citizenId = (identityMatch || incomeMatch || eligibilityMatch)?.[1] || "CIT001";
          const response = identityMatch
            ? mockIdentity(citizenId)
            : incomeMatch
            ? mockIncome(citizenId)
            : mockEligibility(citizenId);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(response, null, 2));
          return;
        }

        const documentMatch = pathname === "/api/documents/verify";
        if (req.method === "POST" && documentMatch) {
          let bodyData = "";
          req.on("data", (chunk) => {
            bodyData += chunk;
          });
          req.on("end", () => {
            const body = bodyData ? JSON.parse(bodyData) : {};
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify(mockDocuments(body.citizenId || "CIT001"), null, 2));
          });
          return;
        }

        // 1d. GET /api/applications
        if (req.method === "GET" && pathname === "/api/applications") {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(getMockApplications(), null, 2));
          return;
        }

        // 1e. GET /api/applications/:applicationId and workflow state
        const applicationMatch = pathname.match(/^\/api\/applications\/([^/]+)$/);
        if (req.method === "GET" && applicationMatch) {
          const application = getMockApplication(applicationMatch[1]);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          if (!application) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "APPLICATION_NOT_FOUND" }));
          } else {
            res.end(JSON.stringify(application, null, 2));
          }
          return;
        }

        const workflowMatch = pathname.match(/^\/api\/workflow\/([^/]+)$/);
        if (req.method === "GET" && workflowMatch) {
          const application = getMockApplication(workflowMatch[1]);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          if (!application) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: "APPLICATION_NOT_FOUND" }));
          } else {
            res.end(JSON.stringify({
              applicationId: application.applicationId,
              currentStep: application.currentStep,
              status: application.status,
              recovered: application.recovered,
              logs: application.logs,
            }, null, 2));
          }
          return;
        }

        // 1f. POST /api/applications/submit
        if (req.method === "POST" && pathname === "/api/applications/submit") {
          let bodyData = "";
          req.on("data", (chunk) => {
            bodyData += chunk;
          });
          req.on("end", async () => {
            try {
              const body = bodyData ? JSON.parse(bodyData) : {};
              const application = await submitMockApplication(
                body.citizenId || "CIT001",
                body.simulateFailure !== false
              );
              const erpApplication = registerErpApplication(
                application.applicationId,
                application.citizenId
              );
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ ...application, erp: erpApplication }, null, 2));
            } catch (error: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({
                error: "WORKFLOW_PROCESSING_FAILED",
                message: error?.message || "Mock workflow failed",
              }));
            }
          });
          return;
        }

        // 2. GET /api/services/registry
        if (req.method === "GET" && pathname === "/api/services/registry") {
          const services = getAllRegisteredServices();
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(services, null, 2));
          return;
        }

        // 3. POST /api/services/:serviceId/request
        const matchServiceRequest = pathname.match(/^\/api\/services\/([^/]+)\/request$/);
        if (req.method === "POST" && matchServiceRequest) {
          const serviceId = matchServiceRequest[1];
          let bodyData = "";

          req.on("data", (chunk) => {
            bodyData += chunk;
          });

          req.on("end", async () => {
            try {
              let parsedBody: any = {};
              if (bodyData) {
                parsedBody = JSON.parse(bodyData);
              }

              const response = await apiGateway.dispatchServiceRequest({
                serviceId: parsedBody.serviceId || serviceId,
                citizenId: parsedBody.citizenId || "GF-IN-2026-AR88219",
                consentGranted: Boolean(parsedBody.consentGranted),
                payload: parsedBody.payload || {},
                idempotencyKey: parsedBody.idempotencyKey,
              });

              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify(response, null, 2));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  success: false,
                  serviceId,
                  requestId: `ERR-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  error: {
                    code: "INTERNAL_GATEWAY_ERROR",
                    message: "The GovFix backend encountered an unexpected error.",
                    retryable: true,
                    details: err?.message,
                  },
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}
