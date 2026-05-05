package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/services"
)

type AuditHandler struct {
	svc *services.AuditService
}

func NewAuditHandler(svc *services.AuditService) *AuditHandler {
	return &AuditHandler{svc: svc}
}

func (h *AuditHandler) List(c *gin.Context) {
	limit := 0
	if q := c.Query("limit"); q != "" {
		if n, err := strconv.Atoi(q); err == nil {
			limit = n
		}
	}
	list, err := h.svc.ListAuditLogs(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	c.JSON(http.StatusOK, list)
}
