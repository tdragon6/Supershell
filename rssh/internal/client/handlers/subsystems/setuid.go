//go:build linux

package subsystems

import (
	"fmt"
	"strconv"
	"syscall"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"golang.org/x/crypto/ssh"
)

type setuid bool

func (su *setuid) Execute(line terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error {
	subsystemReq.Reply(true, nil)

	if len(line.Arguments) != 1 {
		fmt.Fprintf(connection, "setuid only takes one argument, the uid to set rssh to.")
		return nil
	}

	uid, err := strconv.Atoi(line.Arguments[0].Value())

	if err != nil {
		fmt.Fprintf(connection, "%s", err.Error())
		return nil
	}

	return syscall.Setuid(uid)
}
