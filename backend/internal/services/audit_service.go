package services

import (
	"log"

	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/repository"
)

type AuditService struct {
	repo *repository.AuditRepository
}

func NewAuditService(repo *repository.AuditRepository) *AuditService {
	return &AuditService{repo: repo}
}

func (s *AuditService) Log(req models.CreateAuditLogRequest) {
	if err := s.repo.Create(req); err != nil {
		log.Printf("audit log insert failed: %v", err)
	}
}

func (s *AuditService) ListAuditLogs(limit int) ([]models.AuditLogResponse, error) {
	rows, err := s.repo.List(limit)
	if err != nil {
		return nil, err
	}
	out := make([]models.AuditLogResponse, 0, len(rows))
	for i := range rows {
		out = append(out, toAuditLogResponse(&rows[i]))
	}
	return out, nil
}

func toAuditLogResponse(a *models.AuditLog) models.AuditLogResponse {
	return models.AuditLogResponse{
		ID:           a.ID,
		UserID:       a.UserID,
		UserEmail:    a.UserEmail,
		Action:       a.Action,
		ResourceType: a.ResourceType,
		ResourceID:   a.ResourceID,
		Status:       a.Status,
		IPAddress:    a.IPAddress,
		Message:      a.Message,
		CreatedAt:    a.CreatedAt,
	}
}
