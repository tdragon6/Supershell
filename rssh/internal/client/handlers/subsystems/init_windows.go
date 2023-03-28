//go:build windows

package subsystems

//Enable service install
func init() {
	subsystems["service"] = new(service)
}
