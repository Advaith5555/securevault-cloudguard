package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/services"
)

type RiskHandler struct {
	svc *services.RiskService
}

func NewRiskHandler(svc *services.RiskService) *RiskHandler {
	return &RiskHandler{svc: svc}
}

func (h *RiskHandler) Scan(c *gin.Context) {
	idVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	userID, ok := idVal.(string)
	if !ok || userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	emailVal, _ := c.Get("email")
	email, _ := emailVal.(string)

	findings, err := h.svc.Scan(userID, email, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "risk scan failed"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message":  "risk scan completed",
		"findings": findings,
	})
}

func (h *RiskHandler) List(c *gin.Context) {
	list, err := h.svc.ListRisks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	c.JSON(http.StatusOK, list)
}
