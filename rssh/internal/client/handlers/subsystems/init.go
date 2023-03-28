package subsystems

import (
	"fmt"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"golang.org/x/crypto/ssh"
)

// Enable sftp for both windows and linux
var subsystems = map[string]subsystem{
	"sftp": new(subSftp),
	"list": new(list),
}

type subsystem interface {
	Execute(arguments terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error
}

func RunSubsystems(connection ssh.Channel, req *ssh.Request) error {
	if len(req.Payload) < 4 {
		return fmt.Errorf("Payload size is too small <4, not enough space for token")

	}

	line := terminal.ParseLine(string(req.Payload[4:]), 0)
	if subsys, ok := subsystems[line.Command.Value()]; ok {

		return subsys.Execute(line, connection, req)
	}

	req.Reply(false, []byte("Unknown subsystem"))
	return fmt.Errorf("Unknown subsystem '%s'", req.Payload)
}
