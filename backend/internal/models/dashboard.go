package models

type DashboardSummary struct {
	TotalSecrets    int                `json:"total_secrets"`
	DevSecrets      int                `json:"dev_secrets"`
	StagingSecrets  int                `json:"staging_secrets"`
	ProdSecrets     int                `json:"prod_secrets"`
	HighRisks       int                `json:"high_risks"`
	MediumRisks     int                `json:"medium_risks"`
	LowRisks        int                `json:"low_risks"`
	RecentAuditLogs []AuditLogResponse `json:"recent_audit_logs"`
}
