package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestRequireRoles_allowedRole(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("role", RoleAdmin)
		c.Next()
	})
	r.GET("/ok", RequireRoles(RoleAdmin), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/ok", nil))
	if w.Code != http.StatusOK {
		t.Fatalf("expected %d, got %d body=%q", http.StatusOK, w.Code, w.Body.String())
	}
}

func TestRequireRoles_missingRoleUnauthorized(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/x", RequireRoles(RoleAdmin), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected %d, got %d body=%q", http.StatusUnauthorized, w.Code, w.Body.String())
	}
}

func TestRequireRoles_disallowedRoleForbidden(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		c.Set("role", RoleViewer)
		c.Next()
	})
	r.GET("/x", RequireRoles(RoleAdmin), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	w := httptest.NewRecorder()
	r.ServeHTTP(w, httptest.NewRequest(http.MethodGet, "/x", nil))
	if w.Code != http.StatusForbidden {
		t.Fatalf("expected %d, got %d body=%q", http.StatusForbidden, w.Code, w.Body.String())
	}
}
