package commands

import (
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/terminal"
)

type who struct {
}

func (w *who) Run(tty io.ReadWriter, line terminal.ParsedLine) error {

	users := internal.ListUsers()

	for _, user := range users {
		fmt.Fprintf(tty, "%s\n", user)
	}

	return nil
}

func (w *who) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (w *who) Help(explain bool) string {
	if explain {
		return "List users connected to the RSSH server"
	}

	return terminal.MakeHelpText("who")
}
