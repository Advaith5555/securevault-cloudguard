package services

import (
	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/repository"
)

type SecretService struct {
	repo *repository.SecretRepository
}

func NewSecretService(repo *repository.SecretRepository) *SecretService {
	return &SecretService{repo: repo}
}

func (s *SecretService) CreateSecret(req models.CreateSecretRequest, createdBy string) (*models.SecretResponse, error) {
	sec, err := s.repo.Create(req, createdBy)
	if err != nil {
		return nil, err
	}
	return toSecretResponse(sec), nil
}

func (s *SecretService) ListSecrets() ([]models.SecretResponse, error) {
	rows, err := s.repo.List()
	if err != nil {
		return nil, err
	}
	out := make([]models.SecretResponse, 0, len(rows))
	for i := range rows {
		out = append(out, *toSecretResponse(&rows[i]))
	}
	return out, nil
}

func (s *SecretService) GetSecret(id string) (*models.SecretResponse, error) {
	sec, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	return toSecretResponse(sec), nil
}

func (s *SecretService) UpdateSecret(id string, req models.UpdateSecretRequest) (*models.SecretResponse, error) {
	sec, err := s.repo.Update(id, req)
	if err != nil {
		return nil, err
	}
	return toSecretResponse(sec), nil
}

func (s *SecretService) DeleteSecret(id string) error {
	return s.repo.Delete(id)
}

func (s *SecretService) AccessSecret(id string, _ string) (gin.H, error) {
	sec, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if err := s.repo.MarkAccessed(id); err != nil {
		return nil, err
	}
	return gin.H{
		"message":    "secret access simulated",
		"secret_id":  sec.ID,
		"secret_ref": sec.SecretRef,
		"note":       "plaintext secret values are not exposed in this demo endpoint",
	}, nil
}

func toSecretResponse(s *models.Secret) *models.SecretResponse {
	return &models.SecretResponse{
		ID:             s.ID,
		Name:           s.Name,
		Environment:    s.Environment,
		Owner:          s.Owner,
		Service:        s.Service,
		SecretRef:      s.SecretRef,
		CreatedBy:      s.CreatedBy,
		CreatedAt:      s.CreatedAt,
		UpdatedAt:      s.UpdatedAt,
		LastAccessedAt: s.LastAccessedAt,
		ExpiresAt:      s.ExpiresAt,
	}
}
