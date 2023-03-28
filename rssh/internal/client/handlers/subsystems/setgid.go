//go:build linux

package subsystems

import (
	"fmt"
	"strconv"
	"syscall"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"golang.org/x/crypto/ssh"
)

type setgid bool

func (su *setgid) Execute(line terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error {

	subsystemReq.Reply(true, nil)

	if len(line.Arguments) != 1 {
		fmt.Fprintf(connection, "setgid only takes one argument, the uid to set rssh to.")
		return nil
	}

	gid, err := strconv.Atoi(line.Arguments[0].Value())

	if err != nil {
		fmt.Fprintf(connection, "%s", err.Error())
		return nil
	}

	return syscall.Setgid(gid)
}
