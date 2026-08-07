/**
 * ENTERPRISE API STANDARDIZATION & SECURITY ENGINE
 */

import { NextResponse } from "next/server";

export interface ApiResponsePayload<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    version: string;
    timestamp: string;
  };
}

export function apiSuccess<T>(data: T, meta?: Partial<NonNullable<ApiResponsePayload["meta"]>>) {
  return NextResponse.json<ApiResponsePayload<T>>({
    success: true,
    data,
    meta: {
      version: "v1",
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function apiError(error: string, status: number = 400) {
  return NextResponse.json<ApiResponsePayload>({
    success: false,
    error,
    meta: {
      version: "v1",
      timestamp: new Date().toISOString(),
    },
  }, { status });
}
