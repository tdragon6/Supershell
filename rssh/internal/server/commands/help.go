package commands

import (
	"fmt"
	"io"
	"sort"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/internal/terminal/autocomplete"
	"github.com/NHAS/reverse_ssh/pkg/table"
)

type help struct {
}

func (h *help) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	if len(line.Arguments) < 1 {

		t, err := table.NewTable("Commands", "Function", "Purpose")
		if err != nil {
			return err
		}

		keys := []string{}
		for funcName := range allCommands {
			keys = append(keys, funcName)
		}

		sort.Strings(keys)

		for _, k := range keys {
			hf := allCommands[k].Help

			err = t.AddValues(k, hf(true))
			if err != nil {
				return err
			}
		}

		t.Fprint(tty)

		return nil
	}

	l, ok := allCommands[line.Arguments[0].Value()]
	if !ok {
		return fmt.Errorf("Command %s not found", line.Arguments[0].Value())
	}

	fmt.Fprintf(tty, "\ndescription:\n%s\n", l.Help(true))

	fmt.Fprintf(tty, "\nusage:\n%s\n", l.Help(false))

	return nil
}

func (h *help) Expect(line terminal.ParsedLine) []string {
	if len(line.Arguments) <= 1 {
		return []string{autocomplete.Functions}
	}
	return nil
}

func (h *help) Help(explain bool) string {
	if explain {
		return "Get help for commands, or display all commands"
	}

	return terminal.MakeHelpText(
		"help",
		"help <functions>",
	)
}
