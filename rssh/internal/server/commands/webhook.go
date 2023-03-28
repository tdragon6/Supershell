package commands

import (
	"errors"
	"fmt"
	"io"

	"github.com/NHAS/reverse_ssh/internal/server/webhooks"
	"github.com/NHAS/reverse_ssh/internal/terminal"
)

type webhook struct {
}

func (w *webhook) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	if line.IsSet("h") || len(line.Flags) < 1 {
		fmt.Fprintf(tty, "%s", w.Help(false))
		return nil
	}

	if line.IsSet("l") {
		webhooks := webhooks.GetAll()

		if len(webhooks) == 0 {
			fmt.Fprintln(tty, "No active listeners")
			return nil
		}

		for _, listener := range webhooks {
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

		for i, addr := range addrs {
			resultingUrl, err := webhooks.Add(addr, !line.IsSet("insecure"))
			if err != nil {
				fmt.Fprintf(tty, "(%d/%d) Failed: %s, reason: %s\n", i+1, len(addrs), resultingUrl, err.Error())
				continue
			}

			fmt.Fprintf(tty, "(%d/%d) Enabled webhook: %s\n", i+1, len(addrs), resultingUrl)
		}

		return nil

	}

	if off {
		existingWebhooks, err := line.GetArgsString("off")
		if err != nil {
			return err
		}

		for i, hook := range existingWebhooks {
			err := webhooks.Remove(hook)
			if err != nil {
				fmt.Fprintf(tty, "(%d/%d) Failed to remove: %s, reason: %s\n", i+1, len(existingWebhooks), hook, err.Error())
				continue
			}

			fmt.Fprintf(tty, "(%d/%d) Disabled webhook: %s\n", i+1, len(existingWebhooks), hook)
		}
		return nil

	}

	return nil

}

func (w *webhook) Expect(line terminal.ParsedLine) []string {
	return nil
}

func (w *webhook) Help(explain bool) string {
	if explain {
		return "webhook allows you to add or remove webhook outputs"
	}

	return terminal.MakeHelpText(
		"webhook [OPTIONS]",
		"Allows you to set webhooks which currently show the joining and leaving of clients",
		"\t--on\tTurns on webhook/s, must supply output as url",
		"\t--off\tTurns off existing webhook url",
		"\t--insecure\tDisable TLS certificate checking",
		"\t-l\tLists active webhooks",
	)
}
