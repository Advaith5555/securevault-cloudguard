package config

import "os"

type Config struct {
	Port        string
	Environment string
	DatabaseURL string
	JWTSecret   string
}

const (
	defaultDatabaseURL = "postgres://securevault_user:securevault_password@localhost:5433/securevault_db?sslmode=disable"
	defaultJWTSecret   = "development-secret-key"
)

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = defaultDatabaseURL
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = defaultJWTSecret
	}

	return Config{
		Port:        port,
		Environment: env,
		DatabaseURL: dbURL,
		JWTSecret:   jwtSecret,
	}
}
