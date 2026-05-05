package services

import (
	"strings"
	"time"

	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/repository"
)

const (
	riskTypeMissingOwner     = "missing_owner"
	riskTypeMissingService   = "missing_service"
	riskTypeProdMissingOwner = "prod_secret_missing_owner"
	riskTypeStaleSecret      = "stale_secret"
	riskTypeExpiredSecret    = "expired_secret"
	riskLevelLow             = "low"
	riskLevelMedium          = "medium"
	riskLevelHigh            = "high"
)

type RiskService struct {
	secrets *repository.SecretRepository
	risks   *repository.RiskRepository
	audit   *AuditService
}

func NewRiskService(secrets *repository.SecretRepository, risks *repository.RiskRepository, audit *AuditService) *RiskService {
	return &RiskService{secrets: secrets, risks: risks, audit: audit}
}

func (s *RiskService) Scan(userID string, userEmail string, ipAddress string) ([]models.RiskFindingResponse, error) {
	secrets, err := s.secrets.ListForRiskScan()
	if err != nil {
		return nil, err
	}

	now := time.Now()
	cutoff := now.Add(-90 * 24 * time.Hour)
	var findings []models.RiskFinding

	for i := range secrets {
		sec := &secrets[i]
		ownerEmpty := strings.TrimSpace(sec.Owner) == ""
		serviceEmpty := strings.TrimSpace(sec.Service) == ""
		isProd := strings.EqualFold(sec.Environment, "prod")

		if ownerEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeMissingOwner,
				RiskLevel:      riskLevelMedium,
				Description:    "Secret does not have an assigned owner",
				Recommendation: "Assign a responsible owner or team for accountability",
			})
		}
		if serviceEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeMissingService,
				RiskLevel:      riskLevelLow,
				Description:    "Secret is not linked to a service",
				Recommendation: "Associate the secret with a service to improve traceability",
			})
		}
		if isProd && ownerEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeProdMissingOwner,
				RiskLevel:      riskLevelHigh,
				Description:    "Production secret has no owner",
				Recommendation: "Assign an owner immediately for production secret governance",
			})
		}
		if sec.CreatedAt.Before(cutoff) {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeStaleSecret,
				RiskLevel:      riskLevelMedium,
				Description:    "Secret is older than 90 days",
				Recommendation: "Review and rotate this secret if it is still active",
			})
		}
		if sec.ExpiresAt != nil && sec.ExpiresAt.Before(now) {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeExpiredSecret,
				RiskLevel:      riskLevelHigh,
				Description:    "Secret expiry date has already passed",
				Recommendation: "Rotate or remove the expired secret",
			})
		}
	}

	if err := s.risks.ClearAll(); err != nil {
		return nil, err
	}
	if err := s.risks.CreateMany(findings); err != nil {
		return nil, err
	}

	uid := userID
	s.audit.Log(models.CreateAuditLogRequest{
		UserID:       &uid,
		UserEmail:    userEmail,
		Action:       "risk_scan_executed",
		ResourceType: "risk",
		Status:       "success",
		IPAddress:    ipAddress,
		Message:      "risk scan completed",
	})

	return s.ListRisks()
}

func (s *RiskService) ListRisks() ([]models.RiskFindingResponse, error) {
	rows, err := s.risks.List()
	if err != nil {
		return nil, err
	}
	out := make([]models.RiskFindingResponse, 0, len(rows))
	for i := range rows {
		f := &rows[i]
		out = append(out, models.RiskFindingResponse{
			ID:             f.ID,
			SecretID:       f.SecretID,
			RiskType:       f.RiskType,
			RiskLevel:      f.RiskLevel,
			Description:    f.Description,
			Recommendation: f.Recommendation,
			CreatedAt:      f.CreatedAt,
		})
	}
	return out, nil
}
