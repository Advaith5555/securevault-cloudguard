package main

import (
	"fmt"
	"log"

	"securevault-cloudguard/backend/internal/config"
	"securevault-cloudguard/backend/internal/router"
)

func main() {
	cfg := config.Load()
	r := router.SetupRouter(cfg)

	addr := ":" + cfg.Port
	fmt.Printf("SecureVault CloudGuard API listening on %s (env=%s)\n", addr, cfg.Environment)

	if err := r.Run(addr); err != nil {
		log.Fatal(err)
	}
}
