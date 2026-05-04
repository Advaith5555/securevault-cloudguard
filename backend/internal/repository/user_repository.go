package repository

import (
	"database/sql"

	"securevault-cloudguard/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	row := r.db.QueryRow(
		`SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = $1`,
		email,
	)
	var u models.User
	err := row.Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	row := r.db.QueryRow(
		`SELECT id, name, email, password_hash, role, created_at FROM users WHERE id = $1`,
		id,
	)
	var u models.User
	err := row.Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.Role, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
