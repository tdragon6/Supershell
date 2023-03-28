package commands

import (
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/terminal"
)

type version struct {
}

func (v *version) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	fmt.Fprintln(tty, internal.Version)
	return nil
}

func (v *version) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (v *version) Help(explain bool) string {
	if explain {
		return "Give server build version"
	}

	return terminal.MakeHelpText("version")
}
