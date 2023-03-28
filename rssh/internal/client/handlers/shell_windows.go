//go:build windows
// +build windows

package handlers

import (
	"fmt"
	"io"
	"os"
	"os/exec"
	"strings"
	"syscall"

	"github.com/ActiveState/termtest/conpty"
	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"github.com/NHAS/reverse_ssh/pkg/winpty"
	"golang.org/x/crypto/ssh"
	"golang.org/x/sys/windows"
)

// The basic windows shell handler, as there arent any good golang libraries to work with windows conpty
func shell(user *internal.User, connection ssh.Channel, requests <-chan *ssh.Request, log logger.Logger) {

	if user.Pty == nil {
		basicShell(connection, requests, log)
		return
	}

	path, err := exec.LookPath("powershell.exe")
	if err != nil {
		path, err = exec.LookPath("cmd.exe")
		if err != nil {
			path = "C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"
		}
	}

	runCommandWithPty(path, nil, user, requests, log, connection)

	connection.Close()

}

func runCommandWithPty(command string, args []string, user *internal.User, requests <-chan *ssh.Request, log logger.Logger, connection ssh.Channel) {

	fullCommand := command + " " + strings.Join(args, " ")
	vsn := windows.RtlGetVersion()
	if vsn.MajorVersion < 10 || vsn.BuildNumber < 17763 {

		log.Info("Windows version too old for Conpty (%d, %d), using basic shell", vsn.MajorVersion, vsn.BuildNumber)
		runWithWinPty(fullCommand, connection, requests, log, *user.Pty)

	} else {
		err := runWithConpty(fullCommand, connection, requests, log, *user.Pty)
		if err != nil {
			log.Error("unable to run with conpty, falling back to winpty: %v", err)
			runWithWinPty(fullCommand, connection, requests, log, *user.Pty)
		}
	}
}

func runWithWinPty(command string, connection ssh.Channel, reqs <-chan *ssh.Request, log logger.Logger, ptyReq internal.PtyReq) error {

	path, err := exec.LookPath(command)
	if err != nil {
		return err
	}

	options := winpty.Options{
		Command:     path,
		Env:         os.Environ(),
		InitialCols: ptyReq.Columns,
		InitialRows: ptyReq.Rows,
	}

	winpty, err := winpty.OpenWithOptions(options)
	if err != nil {
		log.Info("Winpty failed. %s", err)
		return err
	}

	log.Info("New winpty process  spawned")

	// Dynamically handle resizes of terminal window
	go func() {
		for req := range reqs {
			switch req.Type {

			case "window-change":
				w, h := internal.ParseDims(req.Payload)
				winpty.SetSize(w, h)

			}
		}

		winpty.Close()
	}()

	go func() {
		io.Copy(connection, winpty)
		connection.Close()
	}()

	io.Copy(winpty, connection)

	return nil
}

func runWithConpty(command string, connection ssh.Channel, reqs <-chan *ssh.Request, log logger.Logger, ptyReq internal.PtyReq) error {

	cpty, err := conpty.New(int16(ptyReq.Columns), int16(ptyReq.Rows))
	if err != nil {
		return fmt.Errorf("Could not open a conpty terminal: %v", err)
	}

	path, err := exec.LookPath(command)
	if err != nil {
		return err
	}

	// Spawn and catch new powershell process
	pid, _, err := cpty.Spawn(
		path,
		[]string{},
		&syscall.ProcAttr{
			Env: os.Environ(),
		},
	)
	if err != nil {
		return fmt.Errorf("Could not spawn a powershell: %v", err)
	}
	log.Info("New process with pid %d spawned", pid)
	process, err := os.FindProcess(pid)
	if err != nil {
		return fmt.Errorf("Failed to find process: %v", err)
	}

	// Dynamically handle resizes of terminal window
	go func() {
		for req := range reqs {
			switch req.Type {

			case "window-change":
				w, h := internal.ParseDims(req.Payload)
				cpty.Resize(uint16(w), uint16(h))

			}
		}

		cpty.Close()
	}()

	// Link data streams of ssh session and conpty
	go io.Copy(connection, cpty.OutPipe())
	go io.Copy(cpty.InPipe(), connection)

	_, err = process.Wait()
	if err != nil {
		return fmt.Errorf("Error waiting for process: %v", err)
	}

	return nil
}

func basicShell(connection ssh.Channel, reqs <-chan *ssh.Request, log logger.Logger) {

	cmd := exec.Command("powershell.exe", "-NoProfile", "-WindowStyle", "hidden", "-NoLogo")
	cmd.SysProcAttr = &syscall.SysProcAttr{

		CreationFlags: syscall.STARTF_USESTDHANDLES,
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Error("%s", err)
		fmt.Fprint(connection, "Unable to open stdout pipe")

		return
	}

	cmd.Stderr = cmd.Stdout

	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Error("%s", err)
		fmt.Fprint(connection, "Unable to open stdin pipe")
		return
	}

	err = cmd.Start()
	if err != nil {
		log.Error("%s", err)
		fmt.Fprint(connection, "Could not start powershell")

	}

	go ssh.DiscardRequests(reqs)

	go func() {

		buf := make([]byte, 128)
		defer connection.Close()

		for {

			n, err := stdout.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Error("%s", err)
				}
				return
			}

			_, err = connection.Write(buf[:n])
			if err != nil {
				log.Error("%s", err)
				return
			}
		}
	}()

	go func() {
		buf := make([]byte, 128)
		defer connection.Close()

		for {
			n, err := connection.Read(buf)
			if err != nil {
				if err != io.EOF {
					log.Error("%s", err)
				}
				return
			}

			_, err = stdin.Write(buf[:n])
			if err != nil {
				if err != io.EOF {
					log.Error("%s", err)
				}
				return
			}

		}
	}()

	err = cmd.Wait()
	if err != nil {
		log.Error("%s", err)
	}

	connection.Close()
}
