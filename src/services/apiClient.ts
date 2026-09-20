import { awsConfig } from '../config/awsConfig';
import { ApiResponse } from '../types';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('inveni_auth_token');
    }
  }

  public setToken(token: string | null): void {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      if (token) {
        localStorage.setItem('inveni_auth_token', token);
      } else {
        localStorage.removeItem('inveni_auth_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  /**
   * Safe user-friendly error translator.
   * Maps AWS/DynamoDB technical error codes to human-readable explanations.
   */
  public sanitizeErrorMessage(error: any): { code: string; message: string } {
    const rawMessage = typeof error === 'string' ? error : error?.message || '';
    const rawCode = error?.code || error?.name || 'SERVER_ERROR';

    if (rawCode === 'ConditionalCheckFailedException' || rawMessage.includes('ConditionalCheckFailed')) {
      return {
        code: 'ROOM_ALREADY_RESERVED',
        message: 'This room was just reserved by another user. Please choose another room.',
      };
    }

    if (rawCode === 'NotAuthorizedException' || rawMessage.includes('NotAuthorizedException') || rawCode === '401') {
      return {
        code: 'UNAUTHORIZED',
        message: 'Your session has expired or is invalid. Please sign in again.',
      };
    }

    if (rawCode === 'AccessDeniedException' || rawCode === '403') {
      return {
        code: 'FORBIDDEN',
        message: 'You do not have permission to view or manage this reservation.',
      };
    }

    if (rawCode === 'ResourceNotFoundException' || rawCode === '404') {
      return {
        code: 'NOT_FOUND',
        message: 'The requested property or room could not be found.',
      };
    }

    if (rawMessage.includes('NetworkError') || rawMessage.includes('Failed to fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the Inveni Stay cloud API. Please check your internet connection.',
      };
    }

    return {
      code: rawCode,
      message: rawMessage || 'An unexpected error occurred while processing your request.',
    };
  }

  /**
   * Generic Request Handler
   */
  public async request<T = any>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    if (!awsConfig.isCloudBackendConfigured) {
      // In controlled demo mode, the calling service will use local fallback
      return {
        success: false,
        error: {
          code: 'DEMO_MODE',
          message: 'Running in controlled demo mode. Local repository fallback active.',
        },
      };
    }

    const url = `${awsConfig.apiBaseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const sanitized = this.sanitizeErrorMessage(json?.error || { code: res.status.toString(), message: res.statusText });
        return {
          success: false,
          error: sanitized,
        };
      }

      // Check if standard ApiResponse structure
      if (json && typeof json.success === 'boolean') {
        return json as ApiResponse<T>;
      }

      return {
        success: true,
        data: json as T,
      };
    } catch (err: any) {
      const sanitized = this.sanitizeErrorMessage(err);
      return {
        success: false,
        error: sanitized,
      };
    }
  }

  public async get<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET' });
  }

  public async post<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async patch<T = any>(path: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
