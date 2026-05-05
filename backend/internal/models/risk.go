package models

import "time"

type RiskFinding struct {
	ID             string
	SecretID       string
	RiskType       string
	RiskLevel      string
	Description    string
	Recommendation string
	CreatedAt      time.Time
}

type RiskFindingResponse struct {
	ID             string    `json:"id"`
	SecretID       string    `json:"secret_id"`
	RiskType       string    `json:"risk_type"`
	RiskLevel      string    `json:"risk_level"`
	Description    string    `json:"description"`
	Recommendation string    `json:"recommendation"`
	CreatedAt      time.Time `json:"created_at"`
}
