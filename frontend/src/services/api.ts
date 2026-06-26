const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  is_active: boolean;
  is_admin: boolean;
  role: string;
  created_at: string;
  profile_picture?: string | null;
}

export interface PredictionResult {
  scan_id: string;
  prediction_id: string;
  cancer_type: string;
  prediction: "Low Risk" | "Medium Risk" | "High Risk";
  confidence: number;
  recommendation: string;
  image_path: string;
  created_at: string;
  disclaimer: string;
}

export interface ScanHistoryItem {
  id: string;
  user_id: string;
  cancer_type: string;
  image_path: string;
  created_at: string;
  prediction?: {
    id: string;
    scan_id: string;
    prediction_label: "Low Risk" | "Medium Risk" | "High Risk";
    confidence: number;
    recommendation: string;
    created_at: string;
  } | null;
}

export interface AdminAnalytics {
  stats: {
    total_users: number;
    total_scans: number;
    total_predictions: number;
    total_reports: number;
  };
  cancer_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  recent_signups: Array<{
    id: string;
    email: string;
    full_name: string;
    created_at: string;
  }>;
}

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  scans_count: number;
}

export interface AdminPredictionListItem {
  id: string;
  scan_id: string;
  patient_name: string;
  patient_email: string;
  cancer_type: string;
  prediction: "Low Risk" | "Medium Risk" | "High Risk";
  confidence: number;
  recommendation: string;
  created_at: string;
}

export interface AdminReportListItem {
  id: string;
  prediction_id: string;
  pdf_path: string;
  patient_name: string;
  cancer_type: string;
  prediction: string;
  created_at: string;
}

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Merge headers
    const headers: Record<string, string> = {
      ...(this.getHeaders() as Record<string, string>),
      ...(options.headers as Record<string, string> || {}),
    };
    
    // For file uploads, we delete the Content-Type header so the browser sets the form-data boundary
    if (options.body instanceof FormData && headers["Content-Type"]) {
      delete headers["Content-Type"];
    }

    const mergedOptions = {
      ...options,
      headers,
    };

    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.detail || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient();
export const API_URL = API_BASE_URL;
