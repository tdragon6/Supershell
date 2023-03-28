package commands

import (
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal/server/observers"
	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/pkg/observer"
)

type watch struct {
}

func (w *watch) Run(tty io.ReadWriter, line terminal.ParsedLine) error {

	messages := make(chan string)

	observerId := observers.ConnectionState.Register(func(m observer.Message) {

		c := m.(observers.ClientState)

		var arrowDirection = "<-"
		if c.Status == "disconnected" {
			arrowDirection = "->"
		}

		messages <- fmt.Sprintf("%s %s %s (%s %s) %s %s", c.Timestamp.Format("2006/01/02 15:04:05"), arrowDirection, c.HostName, c.IP, c.ID, c.Version, c.Status)

	})

	term, isTerm := tty.(*terminal.Terminal)
	if isTerm {
		term.EnableRaw()
	}

	go func() {

		b := make([]byte, 1)
		tty.Read(b)

		observers.ConnectionState.Deregister(observerId)

		close(messages)
	}()

	fmt.Fprintf(tty, "Watching clients...\n\r")
	for m := range messages {
		fmt.Fprintf(tty, "%s\n\r", m)
	}

	if isTerm {
		term.DisableRaw()
	}

	return nil
}

func (W *watch) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (w *watch) Help(explain bool) string {
	if explain {
		return "Watches controllable client connections"
	}

	return terminal.MakeHelpText(
		"watch [OPTIONS]",
		"Watch shows continuous connection status of clients (prints the joining and leaving of clients)",
	)
}
