package subsystems

import (
	"fmt"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"golang.org/x/crypto/ssh"
)

type list bool

func (l *list) Execute(line terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error {
	subsystemReq.Reply(true, nil)

	for k := range subsystems {
		fmt.Fprintf(connection, "%s\n", k)
	}

	return nil
}
