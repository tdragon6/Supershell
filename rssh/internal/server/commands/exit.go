package commands

import (
	"io"

	"github.com/NHAS/reverse_ssh/internal/terminal"
)

type exit struct {
}

func (e *exit) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	return io.EOF
}

func (e *exit) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (e *exit) Help(explain bool) string {
	if explain {
		return "Quit connection"
	}

	return terminal.MakeHelpText("exit")
}
