export type Role = "admin" | "developer" | "viewer";

export interface User {
  id: string;
  email: string;
  role: Role;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  status: "success" | "denied" | "failed";
  ip_address: string;
  message: string;
  created_at: string;
}

export interface DashboardSummary {
  total_secrets: number;
  dev_secrets: number;
  staging_secrets: number;
  prod_secrets: number;
  high_risks: number;
  medium_risks: number;
  low_risks: number;
  recent_audit_logs: AuditLog[];
}

export interface Secret {
  id: string;
  name: string;
  environment: "dev" | "staging" | "prod" | string;
  owner: string;
  service: string;
  secret_ref: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string | null;
  expires_at?: string | null;
}

export interface RiskFinding {
  id: string;
  secret_id: string;
  risk_type: string;
  risk_level: "low" | "medium" | "high";
  description: string;
  recommendation: string;
  created_at: string;
}
