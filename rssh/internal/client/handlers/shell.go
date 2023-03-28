//go:build !windows
// +build !windows

package handlers

import (
	"bufio"
	"io"
	"os"
	"os/exec"
	"path"
	"path/filepath"
	"strings"
	"sync"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"github.com/creack/pty"
	"golang.org/x/crypto/ssh"
)

var (
	shells []string

	goodShells = []string{
		"zsh",
		"bash",
		"fish",
		"dash",
		"ash",
		"csh",
		"ksh",
		"tcsh",
		"sh",
	}
)

func getSystemShells() ([]string, error) {
	file, err := os.Open("/etc/shells")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	allSystemShells := []string{}
	potentialShells := []string{}

	search := make(map[string]bool)

	for _, goodShell := range goodShells {
		search[goodShell] = true
	}

	for scanner.Scan() {
		line := scanner.Text()

		if len(line) > 0 && line[0] == '#' || strings.TrimSpace(line) == "" {
			continue
		}

		allSystemShells = append(allSystemShells, line)

		shellPath := strings.TrimSpace(line)

		//if shell name is not in our list of known good shells skip it
		if !search[filepath.Base(shellPath)] {
			continue
		}

		potentialShells = append(potentialShells, shellPath)
	}

	if len(potentialShells) == 0 {
		potentialShells = allSystemShells
	}

	return potentialShells, nil
}

func init() {

	var (
		err             error
		potentialShells []string
	)
	for _, goodShell := range goodShells {
		good, err := exec.LookPath(goodShell)
		if err != nil {
			continue
		}

		potentialShells = append(potentialShells, good)
	}

	if len(potentialShells) == 0 {

		potentialShells, err = getSystemShells()
		if err != nil {

			//Last ditch effort to find a shell
			for _, goodShell := range goodShells {
				potentialShells = append(potentialShells, path.Join("/opt/bin/", goodShell))
				potentialShells = append(potentialShells, path.Join("/opt/", goodShell))
				potentialShells = append(potentialShells, path.Join("/user/local/bin", goodShell))
				potentialShells = append(potentialShells, path.Join("/user/local/sbin", goodShell))
				potentialShells = append(potentialShells, path.Join("/usr/bin/", goodShell))
				potentialShells = append(potentialShells, path.Join("/bin/", goodShell))
				potentialShells = append(potentialShells, path.Join("/sbin/", goodShell))

			}
		}
	}

	for _, s := range potentialShells {

		if stats, err := os.Stat(s); err != nil && (os.IsNotExist(err) || !stats.IsDir()) {
			continue

		}
		shells = append(shells, s)
	}

}

func runCommandWithPty(command string, args []string, user *internal.User, requests <-chan *ssh.Request, log logger.Logger, connection ssh.Channel) {

	if user.Pty == nil {
		log.Error("Requested to run a command with a pty, but did not start a pty")
		return
	}

	// Fire up a shell for this session
	shell := exec.Command(command, args...)
	shell.Env = os.Environ()

	close := func() {
		connection.Close()
		if shell.Process != nil {

			err := shell.Process.Kill()
			if err != nil {
				log.Warning("Failed to kill shell(%s)", err)
			}
		}

		log.Info("Session closed")
	}

	// Allocate a terminal for this channel
	var err error
	var shellIO io.ReadWriteCloser

	shell.Env = append(shell.Env, "TERM="+user.Pty.Term)

	log.Info("Creating pty...")
	shellIO, err = pty.StartWithSize(shell, &pty.Winsize{Cols: uint16(user.Pty.Columns), Rows: uint16(user.Pty.Rows)})
	if err != nil {
		log.Info("Could not start pty (%s)", err)
		close()
		return
	}

	// pipe session to bash and visa-versa
	var once sync.Once
	go func() {
		io.Copy(connection, shellIO)
		once.Do(close)
	}()
	go func() {
		io.Copy(shellIO, connection)
		once.Do(close)
	}()

	go func() {
		for req := range requests {
			switch req.Type {

			case "window-change":
				if shellf, ok := shellIO.(*os.File); ok {
					w, h := internal.ParseDims(req.Payload)
					err = pty.Setsize(shellf, &pty.Winsize{Cols: uint16(w), Rows: uint16(h)})
					if err != nil {
						log.Warning("Unable to set terminal size: %s", err)
					}
				}

			default:
				log.Warning("Unknown request %s", req.Type)
				if req.WantReply {
					req.Reply(false, nil)
				}
			}
		}
	}()

	defer once.Do(close)
	shell.Wait()
}

// This basically handles exactly like a SSH server would
func shell(user *internal.User, connection ssh.Channel, requests <-chan *ssh.Request, log logger.Logger) {

	path := ""
	if len(shells) != 0 {
		path = shells[0]
	}

	if user.Pty != nil {
		runCommandWithPty(path, nil, user, requests, log, connection)
		return
	}

	runCommand(path, nil, connection)

}
