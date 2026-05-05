package models

import "time"

type Secret struct {
	ID             string
	Name           string
	Environment    string
	Owner          string
	Service        string
	SecretRef      string
	CreatedBy      string
	CreatedAt      time.Time
	UpdatedAt      time.Time
	LastAccessedAt *time.Time
	ExpiresAt      *time.Time
}

type CreateSecretRequest struct {
	Name        string     `json:"name" binding:"required"`
	Environment string     `json:"environment" binding:"required"`
	Owner       string     `json:"owner"`
	Service     string     `json:"service"`
	SecretRef   string     `json:"secret_ref" binding:"required"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

type UpdateSecretRequest struct {
	Name        string     `json:"name"`
	Environment string     `json:"environment"`
	Owner       string     `json:"owner"`
	Service     string     `json:"service"`
	SecretRef   string     `json:"secret_ref"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

type SecretResponse struct {
	ID             string     `json:"id"`
	Name           string     `json:"name"`
	Environment    string     `json:"environment"`
	Owner          string     `json:"owner"`
	Service        string     `json:"service"`
	SecretRef      string     `json:"secret_ref"`
	CreatedBy      string     `json:"created_by"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	LastAccessedAt *time.Time `json:"last_accessed_at"`
	ExpiresAt      *time.Time `json:"expires_at"`
}
