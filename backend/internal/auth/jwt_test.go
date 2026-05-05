package auth

import (
	"testing"

	"securevault-cloudguard/backend/internal/models"
)

func TestGenerateToken_nonEmpty(t *testing.T) {
	t.Parallel()
	user := &models.User{
		ID:    "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
		Email: "tester@securevault.local",
		Role:  RoleDeveloper,
	}
	token, err := GenerateToken(user, "test-jwt-secret-for-unit-tests-only")
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}
	if token == "" {
		t.Fatal("expected non-empty token string")
	}
}

func TestValidateToken_roundTripClaims(t *testing.T) {
	t.Parallel()
	secret := "test-jwt-secret-for-unit-tests-only"
	user := &models.User{
		ID:    "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
		Email: "roundtrip@securevault.local",
		Role:  RoleViewer,
	}
	token, err := GenerateToken(user, secret)
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}
	claims, err := ValidateToken(token, secret)
	if err != nil {
		t.Fatalf("ValidateToken: %v", err)
	}
	if claims.UserID != user.ID || claims.Email != user.Email || claims.Role != user.Role {
		t.Fatalf("claims mismatch: got %#v want id=%q email=%q role=%q", claims, user.ID, user.Email, user.Role)
	}
}

func TestValidateToken_invalidTokenString(t *testing.T) {
	t.Parallel()
	_, err := ValidateToken("not-a-valid-jwt", "test-jwt-secret-for-unit-tests-only")
	if err == nil {
		t.Fatal("expected error for garbage token")
	}
}

func TestValidateToken_wrongSecret(t *testing.T) {
	t.Parallel()
	user := &models.User{
		ID:    "cccccccc-cccc-cccc-cccc-cccccccccccc",
		Email: "wrongsecret@securevault.local",
		Role:  RoleAdmin,
	}
	token, err := GenerateToken(user, "signing-secret-a")
	if err != nil {
		t.Fatalf("GenerateToken: %v", err)
	}
	_, err = ValidateToken(token, "different-secret-b")
	if err == nil {
		t.Fatal("expected error when validating with wrong secret")
	}
}
