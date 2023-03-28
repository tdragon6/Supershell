package commands

import (
	"fmt"
	"io"
	"strings"

	"github.com/NHAS/reverse_ssh/internal/server/clients"
	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/internal/terminal/autocomplete"
	"golang.org/x/crypto/ssh"
)

type exec struct {
}

func (e *exec) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	if line.IsSet("h") {
		fmt.Fprintf(tty, "%s", e.Help(false))
		return nil
	}

	if len(line.Arguments) < 2 {
		return fmt.Errorf("Not enough arguments supplied. Needs at least, host|filter command...")
	}

	filter := ""
	command := ""
	if len(line.ArgumentsAsStrings()) > 0 {
		filter = line.ArgumentsAsStrings()[0]
		command = line.RawLine[line.Arguments[0].End():]
	}

	command = strings.TrimSpace(command)

	matchingClients, err := clients.Search(filter)
	if err != nil {
		return err
	}

	if len(matchingClients) == 0 {
		return fmt.Errorf("Unable to find match for '" + filter + "'\n")
	}

	if !(line.IsSet("q") || line.IsSet("raw")) {
		if !line.IsSet("y") {

			fmt.Fprintf(tty, "Run command? [N/y] ")

			if term, ok := tty.(*terminal.Terminal); ok {
				term.EnableRaw()
			}

			b := make([]byte, 1)
			_, err := tty.Read(b)
			if err != nil {
				if term, ok := tty.(*terminal.Terminal); ok {
					term.DisableRaw()
				}
				return err
			}
			if term, ok := tty.(*terminal.Terminal); ok {
				term.DisableRaw()
			}

			if !(b[0] == 'y' || b[0] == 'Y') {
				return fmt.Errorf("\nUser did not enter y/Y, aborting")
			}
		}
	}

	var c struct {
		Cmd string
	}
	c.Cmd = command

	commandByte := ssh.Marshal(&c)

	for id, client := range matchingClients {

		if !(line.IsSet("q") || line.IsSet("raw")) {
			fmt.Fprint(tty, "\n\n")
			fmt.Fprintf(tty, "%s (%s) output:\n", id, client.User()+"@"+client.RemoteAddr().String())
		}

		newChan, r, err := client.OpenChannel("session", nil)
		if err != nil && !line.IsSet("q") {
			fmt.Fprintf(tty, "Failed: %s\n", err)
			continue
		}
		go ssh.DiscardRequests(r)

		response, err := newChan.SendRequest("exec", true, commandByte)
		if err != nil && !line.IsSet("q") {
			fmt.Fprintf(tty, "Failed: %s\n", err)
			continue
		}

		if !response && !line.IsSet("q") {
			fmt.Fprintf(tty, "Failed: client refused\n")
			continue
		}

		if line.IsSet("q") {
			io.Copy(io.Discard, newChan)
			continue
		}

		io.Copy(tty, newChan)
		newChan.Close()
	}

	fmt.Fprint(tty, "\n")

	return nil
}

func (e *exec) Expect(line terminal.ParsedLine) []string {
	return []string{autocomplete.RemoteId}
}

func (e *exec) Help(explain bool) string {
	if explain {
		return "Execute a command on one or more rssh client"
	}

	return terminal.MakeHelpText(
		"exec [OPTIONS] filter|host command",
		"Filter uses glob matching against all attributes of a target (hostname, ip, id), allowing you to run a command against multiple machines",
		"\t-q\tQuiet, no output (will also remove confirmation prompt)",
		"\t-y\tNo confirmation prompt",
		"\t--raw\tDo not label output blocks with the client they came from",
	)
}
