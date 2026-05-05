package services

import (
	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/repository"
)

type DashboardService struct {
	dashboardRepo *repository.DashboardRepository
	auditService  *AuditService
}

func NewDashboardService(dashboardRepo *repository.DashboardRepository, auditService *AuditService) *DashboardService {
	return &DashboardService{dashboardRepo: dashboardRepo, auditService: auditService}
}

func (s *DashboardService) GetSummary() (*models.DashboardSummary, error) {
	total, dev, staging, prod, err := s.dashboardRepo.CountSecretsByEnvironment()
	if err != nil {
		return nil, err
	}
	high, medium, low, err := s.dashboardRepo.CountRisksByLevel()
	if err != nil {
		return nil, err
	}
	logs, err := s.auditService.ListAuditLogs(5)
	if err != nil {
		return nil, err
	}
	return &models.DashboardSummary{
		TotalSecrets:    total,
		DevSecrets:      dev,
		StagingSecrets:  staging,
		ProdSecrets:     prod,
		HighRisks:       high,
		MediumRisks:     medium,
		LowRisks:        low,
		RecentAuditLogs: logs,
	}, nil
}
