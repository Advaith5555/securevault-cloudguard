package repository

import (
	"database/sql"

	"securevault-cloudguard/backend/internal/models"
)

type RiskRepository struct {
	db *sql.DB
}

func NewRiskRepository(db *sql.DB) *RiskRepository {
	return &RiskRepository{db: db}
}

func (r *RiskRepository) ClearAll() error {
	_, err := r.db.Exec(`DELETE FROM risk_findings`)
	return err
}

func (r *RiskRepository) CreateMany(findings []models.RiskFinding) error {
	if len(findings) == 0 {
		return nil
	}
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	stmt := `INSERT INTO risk_findings (secret_id, risk_type, risk_level, description, recommendation)
		VALUES ($1, $2, $3, $4, $5)`
	for i := range findings {
		f := &findings[i]
		if _, err := tx.Exec(stmt, f.SecretID, f.RiskType, f.RiskLevel, f.Description, f.Recommendation); err != nil {
			return err
		}
	}
	return tx.Commit()
}

func (r *RiskRepository) List() ([]models.RiskFinding, error) {
	rows, err := r.db.Query(
		`SELECT id, secret_id, risk_type, risk_level, description, recommendation, created_at
		FROM risk_findings
		ORDER BY
			CASE risk_level WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC,
			created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []models.RiskFinding
	for rows.Next() {
		var f models.RiskFinding
		err := rows.Scan(&f.ID, &f.SecretID, &f.RiskType, &f.RiskLevel, &f.Description, &f.Recommendation, &f.CreatedAt)
		if err != nil {
			return nil, err
		}
		list = append(list, f)
	}
	return list, rows.Err()
}
