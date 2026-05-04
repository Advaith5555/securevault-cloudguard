package router

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/config"
)

func SetupRouter(cfg config.Config, db *sql.DB) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"service":     "securevault-cloudguard-api",
			"environment": cfg.Environment,
		})
	})

	r.GET("/health/db", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"status":   "error",
				"database": "disconnected",
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status":   "ok",
			"database": "connected",
		})
	})

	return r
}
