package main

import (
	"fmt"
	"log"

	"securevault-cloudguard/backend/internal/config"
	"securevault-cloudguard/backend/internal/database"
	"securevault-cloudguard/backend/internal/router"
)

func main() {
	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("database: %v", err)
	}
	defer db.Close()

	r := router.SetupRouter(cfg, db)

	addr := ":" + cfg.Port
	fmt.Printf("SecureVault CloudGuard API listening on %s (env=%s)\n", addr, cfg.Environment)

	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
