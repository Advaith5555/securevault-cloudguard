package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"securevault-cloudguard/backend/internal/models"
)

type SecretRepository struct {
	db *sql.DB
}

func NewSecretRepository(db *sql.DB) *SecretRepository {
	return &SecretRepository{db: db}
}

func (r *SecretRepository) Create(req models.CreateSecretRequest, createdBy string) (*models.Secret, error) {
	var owner any
	if req.Owner != "" {
		owner = req.Owner
	}
	var service any
	if req.Service != "" {
		service = req.Service
	}
	var expires any
	if req.ExpiresAt != nil {
		expires = *req.ExpiresAt
	}

	row := r.db.QueryRow(
		`INSERT INTO secrets (name, environment, owner, service, secret_ref, created_by, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, name, environment, owner, service, secret_ref, created_by, created_at, updated_at, last_accessed_at, expires_at`,
		req.Name,
		req.Environment,
		owner,
		service,
		req.SecretRef,
		createdBy,
		expires,
	)
	return scanSecret(row)
}

func (r *SecretRepository) List() ([]models.Secret, error) {
	rows, err := r.db.Query(
		`SELECT id, name, environment, owner, service, secret_ref, created_by, created_at, updated_at, last_accessed_at, expires_at
		FROM secrets ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.Secret
	for rows.Next() {
		s, err := scanSecret(rows)
		if err != nil {
			return nil, err
		}
		list = append(list, *s)
	}
	return list, rows.Err()
}

func (r *SecretRepository) ListForRiskScan() ([]models.Secret, error) {
	return r.List()
}

func (r *SecretRepository) GetByID(id string) (*models.Secret, error) {
	row := r.db.QueryRow(
		`SELECT id, name, environment, owner, service, secret_ref, created_by, created_at, updated_at, last_accessed_at, expires_at
		FROM secrets WHERE id = $1`,
		id,
	)
	return scanSecret(row)
}

func (r *SecretRepository) Update(id string, req models.UpdateSecretRequest) (*models.Secret, error) {
	setParts := []string{"updated_at = CURRENT_TIMESTAMP"}
	args := []any{}
	argN := 1

	if req.Name != "" {
		setParts = append(setParts, fmt.Sprintf("name = $%d", argN))
		args = append(args, req.Name)
		argN++
	}
	if req.Environment != "" {
		setParts = append(setParts, fmt.Sprintf("environment = $%d", argN))
		args = append(args, req.Environment)
		argN++
	}
	if req.Owner != "" {
		setParts = append(setParts, fmt.Sprintf("owner = $%d", argN))
		args = append(args, req.Owner)
		argN++
	}
	if req.Service != "" {
		setParts = append(setParts, fmt.Sprintf("service = $%d", argN))
		args = append(args, req.Service)
		argN++
	}
	if req.SecretRef != "" {
		setParts = append(setParts, fmt.Sprintf("secret_ref = $%d", argN))
		args = append(args, req.SecretRef)
		argN++
	}
	if req.ExpiresAt != nil {
		setParts = append(setParts, fmt.Sprintf("expires_at = $%d", argN))
		args = append(args, req.ExpiresAt)
		argN++
	}

	args = append(args, id)
	query := fmt.Sprintf(
		`UPDATE secrets SET %s WHERE id = $%d
		RETURNING id, name, environment, owner, service, secret_ref, created_by, created_at, updated_at, last_accessed_at, expires_at`,
		strings.Join(setParts, ", "),
		argN,
	)

	row := r.db.QueryRow(query, args...)
	return scanSecret(row)
}

func (r *SecretRepository) Delete(id string) error {
	res, err := r.db.Exec(`DELETE FROM secrets WHERE id = $1`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *SecretRepository) MarkAccessed(id string) error {
	res, err := r.db.Exec(`UPDATE secrets SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = $1`, id)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

type secretScanner interface {
	Scan(dest ...any) error
}

func scanSecret(row secretScanner) (*models.Secret, error) {
	var (
		s            models.Secret
		owner        sql.NullString
		service      sql.NullString
		createdBy    sql.NullString
		lastAccessed sql.NullTime
		expires      sql.NullTime
	)

	err := row.Scan(
		&s.ID,
		&s.Name,
		&s.Environment,
		&owner,
		&service,
		&s.SecretRef,
		&createdBy,
		&s.CreatedAt,
		&s.UpdatedAt,
		&lastAccessed,
		&expires,
	)
	if err != nil {
		return nil, err
	}

	if owner.Valid {
		s.Owner = owner.String
	}
	if service.Valid {
		s.Service = service.String
	}
	if createdBy.Valid {
		s.CreatedBy = createdBy.String
	}
	if lastAccessed.Valid {
		t := lastAccessed.Time
		s.LastAccessedAt = &t
	}
	if expires.Valid {
		t := expires.Time
		s.ExpiresAt = &t
	}

	return &s, nil
}
