package auth

const (
	RoleAdmin     = "admin"
	RoleDeveloper = "developer"
	RoleViewer    = "viewer"
)

func IsValidRole(role string) bool {
	switch role {
	case RoleAdmin, RoleDeveloper, RoleViewer:
		return true
	default:
		return false
	}
}
