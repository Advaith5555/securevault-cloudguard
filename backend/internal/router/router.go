package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/config"
)

func SetupRouter(cfg config.Config) *gin.Engine {
	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "ok",
			"service":     "securevault-cloudguard-api",
			"environment": cfg.Environment,
		})
	})

	return r
}
