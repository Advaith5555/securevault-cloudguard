package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/models"
	"securevault-cloudguard/backend/internal/services"
)

type SecretHandler struct {
	svc   *services.SecretService
	audit *services.AuditService
}

func NewSecretHandler(svc *services.SecretService, audit *services.AuditService) *SecretHandler {
	return &SecretHandler{svc: svc, audit: audit}
}

func (h *SecretHandler) Create(c *gin.Context) {
	var req models.CreateSecretRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
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

	resp, err := h.svc.CreateSecret(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	rid := resp.ID
	uid := userID
	h.audit.Log(models.CreateAuditLogRequest{
		UserID:       &uid,
		UserEmail:    email,
		Action:       "secret_created",
		ResourceType: "secret",
		ResourceID:   &rid,
		Status:       "success",
		IPAddress:    c.ClientIP(),
		Message:      "secret metadata created",
	})
	c.JSON(http.StatusCreated, resp)
}

func (h *SecretHandler) List(c *gin.Context) {
	list, err := h.svc.ListSecrets()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	c.JSON(http.StatusOK, list)
}

func (h *SecretHandler) GetByID(c *gin.Context) {
	id := c.Param("id")
	resp, err := h.svc.GetSecret(id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

func (h *SecretHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req models.UpdateSecretRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	resp, err := h.svc.UpdateSecret(id, req)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	idCopy := id
	emailVal, _ := c.Get("email")
	email, _ := emailVal.(string)
	userVal, _ := c.Get("user_id")
	userID, _ := userVal.(string)
	var uidPtr *string
	if userID != "" {
		uid := userID
		uidPtr = &uid
	}
	h.audit.Log(models.CreateAuditLogRequest{
		UserID:       uidPtr,
		UserEmail:    email,
		Action:       "secret_updated",
		ResourceType: "secret",
		ResourceID:   &idCopy,
		Status:       "success",
		IPAddress:    c.ClientIP(),
		Message:      "secret metadata updated",
	})
	c.JSON(http.StatusOK, resp)
}

func (h *SecretHandler) Delete(c *gin.Context) {
	id := c.Param("id")
	if err := h.svc.DeleteSecret(id); err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	idCopy := id
	emailVal, _ := c.Get("email")
	email, _ := emailVal.(string)
	userVal, _ := c.Get("user_id")
	userID, _ := userVal.(string)
	var uidPtr *string
	if userID != "" {
		uid := userID
		uidPtr = &uid
	}
	h.audit.Log(models.CreateAuditLogRequest{
		UserID:       uidPtr,
		UserEmail:    email,
		Action:       "secret_deleted",
		ResourceType: "secret",
		ResourceID:   &idCopy,
		Status:       "success",
		IPAddress:    c.ClientIP(),
		Message:      "secret metadata deleted",
	})
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *SecretHandler) Access(c *gin.Context) {
	id := c.Param("id")
	roleVal, ok := c.Get("role")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	role, ok := roleVal.(string)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	body, err := h.svc.AccessSecret(id, role)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	idCopy := id
	emailVal, _ := c.Get("email")
	email, _ := emailVal.(string)
	userVal, _ := c.Get("user_id")
	userID, _ := userVal.(string)
	var uidPtr *string
	if userID != "" {
		uid := userID
		uidPtr = &uid
	}
	h.audit.Log(models.CreateAuditLogRequest{
		UserID:       uidPtr,
		UserEmail:    email,
		Action:       "secret_accessed",
		ResourceType: "secret",
		ResourceID:   &idCopy,
		Status:       "success",
		IPAddress:    c.ClientIP(),
		Message:      "secret access simulated",
	})
	c.JSON(http.StatusOK, body)
}
