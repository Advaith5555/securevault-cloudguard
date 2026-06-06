package services

import (
	"strings"
	"time"

	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/repository"
)

const (
	// HIGH
	riskTypeProdMissingOwner = "prod_secret_missing_owner"
	riskTypeMissingSecretRef = "missing_secret_ref"
	// MEDIUM
	riskTypeNoExpiry      = "no_expiry"
	riskTypeLongLivedProd = "long_lived_prod_secret"
	// LOW
	riskTypeMissingService = "missing_service"
	riskTypeStaleDevSecret = "stale_dev_secret"

	riskLevelLow    = "low"
	riskLevelMedium = "medium"
	riskLevelHigh   = "high"

	prodAgeCutoffDays = 180
	devAgeCutoffDays  = 365
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
	prodCutoff := now.AddDate(0, 0, -prodAgeCutoffDays)
	devCutoff := now.AddDate(0, 0, -devAgeCutoffDays)

	var findings []models.RiskFinding

	for i := range secrets {
		sec := &secrets[i]
		ownerEmpty := strings.TrimSpace(sec.Owner) == ""
		serviceEmpty := strings.TrimSpace(sec.Service) == ""
		refEmpty := strings.TrimSpace(sec.SecretRef) == ""
		isProd := strings.EqualFold(sec.Environment, "prod")
		isDev := strings.EqualFold(sec.Environment, "dev")

		// HIGH — production secret has no owner
		if isProd && ownerEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeProdMissingOwner,
				RiskLevel:      riskLevelHigh,
				Description:    "Production secrets must have a responsible owner.",
				Recommendation: "Assign an owning team before production use.",
			})
		}

		// HIGH — secret_ref not linked to an external vault
		if refEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeMissingSecretRef,
				RiskLevel:      riskLevelHigh,
				Description:    "Secret is not linked to an external secret manager.",
				Recommendation: "Store the credential in Vault, AWS Secrets Manager, or similar.",
			})
		}

		// MEDIUM — no expiry / rotation schedule configured
		if sec.ExpiresAt == nil {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeNoExpiry,
				RiskLevel:      riskLevelMedium,
				Description:    "Rotation schedule is not configured.",
				Recommendation: "Define a rotation policy.",
			})
		}

		// MEDIUM — production secret older than 180 days
		if isProd && sec.CreatedAt.Before(prodCutoff) {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeLongLivedProd,
				RiskLevel:      riskLevelMedium,
				Description:    "Secret has existed for an extended period.",
				Recommendation: "Rotate and reissue the credential.",
			})
		}

		// LOW — service tag missing
		if serviceEmpty {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeMissingService,
				RiskLevel:      riskLevelLow,
				Description:    "Associated service is not documented.",
				Recommendation: "Add a service owner tag.",
			})
		}

		// LOW — development secret older than 365 days
		if isDev && sec.CreatedAt.Before(devCutoff) {
			findings = append(findings, models.RiskFinding{
				SecretID:       sec.ID,
				RiskType:       riskTypeStaleDevSecret,
				RiskLevel:      riskLevelLow,
				Description:    "Development credential appears inactive.",
				Recommendation: "Review whether it can be removed.",
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
		Action:       "risk_scan_completed",
		ResourceType: "risk",
		Status:       "success",
		IPAddress:    ipAddress,
		Message:      "Metadata risk scan executed successfully.",
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
