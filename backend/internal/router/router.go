package router

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/auth"
	"securevault-cloudguard/backend/internal/config"
	"securevault-cloudguard/backend/internal/handlers"
	"securevault-cloudguard/backend/internal/repository"
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

	userRepo := repository.NewUserRepository(db)
	authHandler := handlers.NewAuthHandler(userRepo, cfg.JWTSecret)

	v1 := r.Group("/api/v1")
	authRoutes := v1.Group("/auth")
	authRoutes.POST("/login", authHandler.Login)
	authRoutes.GET("/me", auth.AuthMiddleware(cfg.JWTSecret), authHandler.Me)

	rbac := v1.Group("/rbac")
	rbac.Use(auth.AuthMiddleware(cfg.JWTSecret))
	rbac.GET("/admin-check", auth.RequireRoles(auth.RoleAdmin), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "admin access granted"})
	})
	rbac.GET("/developer-check", auth.RequireRoles(auth.RoleAdmin, auth.RoleDeveloper), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "developer access granted"})
	})
	rbac.GET("/viewer-check", auth.RequireRoles(auth.RoleAdmin, auth.RoleDeveloper, auth.RoleViewer), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "viewer access granted"})
	})

	return r
}
