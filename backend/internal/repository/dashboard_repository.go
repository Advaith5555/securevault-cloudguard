package repository

import "database/sql"

type DashboardRepository struct {
	db *sql.DB
}

func NewDashboardRepository(db *sql.DB) *DashboardRepository {
	return &DashboardRepository{db: db}
}

func (r *DashboardRepository) CountSecretsByEnvironment() (total int, dev int, staging int, prod int, err error) {
	err = r.db.QueryRow(`SELECT COUNT(*) FROM secrets`).Scan(&total)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	err = r.db.QueryRow(`SELECT COUNT(*) FROM secrets WHERE environment = 'dev'`).Scan(&dev)
	if err != nil {
		return total, 0, 0, 0, err
	}
	err = r.db.QueryRow(`SELECT COUNT(*) FROM secrets WHERE environment = 'staging'`).Scan(&staging)
	if err != nil {
		return total, dev, 0, 0, err
	}
	err = r.db.QueryRow(`SELECT COUNT(*) FROM secrets WHERE environment = 'prod'`).Scan(&prod)
	if err != nil {
		return total, dev, staging, 0, err
	}
	return total, dev, staging, prod, nil
}

func (r *DashboardRepository) CountRisksByLevel() (high int, medium int, low int, err error) {
	err = r.db.QueryRow(`SELECT COUNT(*) FROM risk_findings WHERE risk_level = 'high'`).Scan(&high)
	if err != nil {
		return 0, 0, 0, err
	}
	err = r.db.QueryRow(`SELECT COUNT(*) FROM risk_findings WHERE risk_level = 'medium'`).Scan(&medium)
	if err != nil {
		return high, 0, 0, err
	}
	err = r.db.QueryRow(`SELECT COUNT(*) FROM risk_findings WHERE risk_level = 'low'`).Scan(&low)
	if err != nil {
		return high, medium, 0, err
	}
	return high, medium, low, nil
}
