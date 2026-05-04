package handlers

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"

	"securevault-cloudguard/backend/internal/auth"
	"securevault-cloudguard/backend/internal/repository"
)

type AuthHandler struct {
	users     *repository.UserRepository
	jwtSecret string
}

func NewAuthHandler(users *repository.UserRepository, jwtSecret string) *AuthHandler {
	return &AuthHandler{users: users, jwtSecret: jwtSecret}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user, err := h.users.GetByEmail(req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}

	if !auth.CheckPassword(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	token, err := auth.GenerateToken(user, h.jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	idVal, _ := c.Get("user_id")
	emailVal, _ := c.Get("email")
	roleVal, _ := c.Get("role")
	c.JSON(http.StatusOK, gin.H{
		"id":    idVal.(string),
		"email": emailVal.(string),
		"role":  roleVal.(string),
	})
}
