package subsystems

import (
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type subSftp bool

func (s *subSftp) Execute(_ terminal.ParsedLine, connection ssh.Channel, subsystemReq *ssh.Request) error {
	server, err := sftp.NewServer(connection)
	if err != nil {
		subsystemReq.Reply(false, []byte(err.Error()))
		return err
	}

	subsystemReq.Reply(true, nil)

	err = server.Serve()
	if err != io.EOF && err != nil {
		return fmt.Errorf("sftp server had an error: %s", err.Error())
	}

	return nil
}
