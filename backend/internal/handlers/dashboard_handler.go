package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/services"
)

type DashboardHandler struct {
	svc *services.DashboardService
}

func NewDashboardHandler(svc *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{svc: svc}
}

func (h *DashboardHandler) Summary(c *gin.Context) {
	summary, err := h.svc.GetSummary()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load dashboard summary"})
		return
	}
	c.JSON(http.StatusOK, summary)
}
