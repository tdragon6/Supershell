package commands

import (
	"errors"
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"github.com/NHAS/reverse_ssh/pkg/mux"
)

type listen struct {
	m   *mux.Multiplexer
	log logger.Logger
}

func (w *listen) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	if line.IsSet("h") || len(line.Flags) < 1 {
		fmt.Fprintf(tty, "%s", w.Help(false))
		return nil
	}

	if line.IsSet("l") {
		listeners := w.m.GetListeners()

		if len(listeners) == 0 {
			fmt.Fprintln(tty, "No active listeners")
			return nil
		}

		for _, listener := range listeners {
			fmt.Fprintf(tty, "%s\n", listener)
		}
		return nil
	}

	on := line.IsSet("on")
	off := line.IsSet("off")

	if on && off {
		return errors.New("Cannot specify on and off at the same time")
	}

	if on {
		addrs, err := line.GetArgsString("on")
		if err != nil {
			return err
		}

		for _, addr := range addrs {
			err := w.m.StartListener("tcp", addr)
			if err != nil {
				return err
			}
			fmt.Fprintln(tty, "started listening on: ", addr)
		}

		return nil
	}

	if off {
		addrs, err := line.GetArgsString("off")
		if err != nil {
			return err
		}

		for _, addr := range addrs {
			err := w.m.StopListener(addr)
			if err != nil {
				return err
			}
			fmt.Fprintln(tty, "stopped listening on: ", addr)
		}

		return nil
	}

	return nil
}

func (W *listen) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (w *listen) Help(explain bool) string {
	if explain {
		return "listen changes the rssh server ports, start or stop multiple listening ports"
	}

	return terminal.MakeHelpText(
		"listen [OPTION] [PORT]",
		"listen starts or stops listening ports",
		"\t--on\tTurn on port, e.g --on :8080 127.0.0.1:4444",
		"\t--off\tTurn off port, e.g --off :8080 127.0.0.1:4444",
		"\t-l\tList all enabled addresses",
	)
}

func Listen(multiplexer *mux.Multiplexer, log logger.Logger) *listen {
	return &listen{
		m:   multiplexer,
		log: log,
	}
}
