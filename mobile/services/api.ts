// API Client for CancerGuard AI FastAPI Backend
// Update API_BASE_URL to your backend IP when testing on a physical device
// e.g. "http://192.168.1.100:8000/api" (use your machine's local IP, not localhost)

import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "http://192.168.1.100:8000/api";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  age: number | null;
  gender: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
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

async function getHeaders(): Promise<HeadersInit> {
  const token = await AsyncStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getHeaders();

  const mergedHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
    ...(options.headers as Record<string, string> || {}),
  };

  if (options.body instanceof FormData && mergedHeaders["Content-Type"]) {
    delete mergedHeaders["Content-Type"];
  }

  const response = await fetch(url, { ...options, headers: mergedHeaders });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body: any) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  },
};
