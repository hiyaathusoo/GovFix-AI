export interface NormalizedSuccessResponse<T = any> {
  success: true;
  serviceId: string;
  requestId: string;
  timestamp: string;
  status: "submitted" | "completed" | "processing" | "queued";
  data: T;
  error: null;
}

export interface NormalizedErrorPayload {
  code: string;
  message: string;
  retryable: boolean;
  details?: string;
}

export interface NormalizedErrorResponse {
  success: false;
  serviceId: string;
  requestId: string;
  timestamp: string;
  error: NormalizedErrorPayload;
}

export type NormalizedResponse<T = any> =
  | NormalizedSuccessResponse<T>
  | NormalizedErrorResponse;
