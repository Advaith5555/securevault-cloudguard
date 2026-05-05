package auth

import (
	"testing"

	"golang.org/x/crypto/bcrypt"
)

func TestCheckPassword_correctPasswordMatches(t *testing.T) {
	t.Parallel()
	password := "unit-test-password-ok"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword: %v", err)
	}
	if !CheckPassword(password, string(hash)) {
		t.Fatal("expected correct password to match generated hash")
	}
}

func TestCheckPassword_wrongPasswordFails(t *testing.T) {
	t.Parallel()
	password := "correct-horse-staple"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword: %v", err)
	}
	if CheckPassword("wrong-password", string(hash)) {
		t.Fatal("expected wrong password not to match hash")
	}
}
