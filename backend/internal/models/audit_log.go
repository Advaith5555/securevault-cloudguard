package models

import "time"

type AuditLog struct {
	ID           string
	UserID       *string
	UserEmail    string
	Action       string
	ResourceType string
	ResourceID   *string
	Status       string
	IPAddress    string
	Message      string
	CreatedAt    time.Time
}

type CreateAuditLogRequest struct {
	UserID       *string
	UserEmail    string
	Action       string
	ResourceType string
	ResourceID   *string
	Status       string
	IPAddress    string
	Message      string
}

type AuditLogResponse struct {
	ID           string    `json:"id"`
	UserID       *string   `json:"user_id,omitempty"`
	UserEmail    string    `json:"user_email"`
	Action       string    `json:"action"`
	ResourceType string    `json:"resource_type"`
	ResourceID   *string   `json:"resource_id,omitempty"`
	Status       string    `json:"status"`
	IPAddress    string    `json:"ip_address"`
	Message      string    `json:"message"`
	CreatedAt    time.Time `json:"created_at"`
}
