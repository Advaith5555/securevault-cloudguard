package repository

import (
	"database/sql"

	"securevault-cloudguard/backend/internal/models"
)

type AuditRepository struct {
	db *sql.DB
}

func NewAuditRepository(db *sql.DB) *AuditRepository {
	return &AuditRepository{db: db}
}

func (r *AuditRepository) Create(req models.CreateAuditLogRequest) error {
	var userID interface{}
	if req.UserID != nil && *req.UserID != "" {
		userID = *req.UserID
	}
	var resourceID interface{}
	if req.ResourceID != nil && *req.ResourceID != "" {
		resourceID = *req.ResourceID
	}

	_, err := r.db.Exec(
		`INSERT INTO audit_logs (user_id, user_email, action, resource_type, resource_id, status, ip_address, message)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		userID,
		nullIfEmpty(req.UserEmail),
		req.Action,
		nullIfEmpty(req.ResourceType),
		resourceID,
		req.Status,
		nullIfEmpty(req.IPAddress),
		nullIfEmpty(req.Message),
	)
	return err
}

func nullIfEmpty(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func (r *AuditRepository) List(limit int) ([]models.AuditLog, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	rows, err := r.db.Query(
		`SELECT id, user_id, user_email, action, resource_type, resource_id, status, ip_address, message, created_at
		FROM audit_logs ORDER BY created_at DESC LIMIT $1`,
		limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.AuditLog
	for rows.Next() {
		var (
			a           models.AuditLog
			userID      sql.NullString
			userEmail   sql.NullString
			resourceTyp sql.NullString
			resourceID  sql.NullString
			ipAddr      sql.NullString
			message     sql.NullString
		)
		err := rows.Scan(
			&a.ID,
			&userID,
			&userEmail,
			&a.Action,
			&resourceTyp,
			&resourceID,
			&a.Status,
			&ipAddr,
			&message,
			&a.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		if userID.Valid {
			s := userID.String
			a.UserID = &s
		}
		if userEmail.Valid {
			a.UserEmail = userEmail.String
		}
		if resourceTyp.Valid {
			a.ResourceType = resourceTyp.String
		}
		if resourceID.Valid {
			s := resourceID.String
			a.ResourceID = &s
		}
		if ipAddr.Valid {
			a.IPAddress = ipAddr.String
		}
		if message.Valid {
			a.Message = message.String
		}
		list = append(list, a)
	}
	return list, rows.Err()
}
