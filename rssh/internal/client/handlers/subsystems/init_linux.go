package subsystems

//Enable setuid and setgid for linux only
func init() {
	subsystems["setuid"] = new(setuid)
	subsystems["setgid"] = new(setgid)
}
