export function mapRole(role: unknown): "USER" | "ADMIN" {
	return role === 1 || role === "ADMIN" ? "ADMIN" : "USER";
}
