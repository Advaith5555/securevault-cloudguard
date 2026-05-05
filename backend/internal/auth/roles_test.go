package auth

import "testing"

func TestIsValidRole_knownRoles(t *testing.T) {
	t.Parallel()
	for _, role := range []string{RoleAdmin, RoleDeveloper, RoleViewer} {
		if !IsValidRole(role) {
			t.Errorf("IsValidRole(%q) = false, want true", role)
		}
	}
}

func TestIsValidRole_unknownRole(t *testing.T) {
	t.Parallel()
	if IsValidRole("superuser") {
		t.Fatal("IsValidRole should reject arbitrary role strings")
	}
}

func TestRoleConstants_nonEmpty(t *testing.T) {
	t.Parallel()
	if RoleAdmin == "" || RoleDeveloper == "" || RoleViewer == "" {
		t.Fatalf("role constants must be non-empty (admin=%q developer=%q viewer=%q)",
			RoleAdmin, RoleDeveloper, RoleViewer)
	}
}
