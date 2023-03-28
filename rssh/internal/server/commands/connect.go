package commands

import (
	"fmt"
	"io"
	"sync"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/server/clients"
	"github.com/NHAS/reverse_ssh/internal/terminal"
	"github.com/NHAS/reverse_ssh/internal/terminal/autocomplete"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

type connect struct {
	log  logger.Logger
	user *internal.User
}

func (c *connect) Run(tty io.ReadWriter, line terminal.ParsedLine) error {
	if c.user.Pty == nil {
		return fmt.Errorf("Connect requires a pty")
	}

	term, ok := tty.(*terminal.Terminal)
	if !ok {
		return fmt.Errorf("connect can only be called from the terminal, if you want to connect to your clients without connecting to the terminal use jumphost syntax -J")
	}

	if len(line.Arguments) < 1 {
		return fmt.Errorf(c.Help(false))
	}

	shell, _ := line.GetArgString("shell")

	client := line.Arguments[len(line.Arguments)-1].Value()

	foundClients, err := clients.Search(client)
	if err != nil {
		return err
	}

	if len(foundClients) == 0 {
		return fmt.Errorf("No clients matched '%s'", client)
	}

	if len(foundClients) > 1 {
		return fmt.Errorf("'%s' matches multiple clients please choose a more specific identifier", client)
	}

	var target ssh.Conn
	//Horrible way of getting the first element of a map in go
	for k := range foundClients {
		target = foundClients[k]
		break
	}

	defer func() {
		c.log.Info("Disconnected from remote host %s (%s)", target.RemoteAddr(), target.ClientVersion())
		term.DisableRaw()
	}()

	//Attempt to connect to remote host and send inital pty request and screen size
	// If we cant, report and error to the clients terminal
	newSession, err := createSession(target, *c.user.Pty, shell)
	if err != nil {

		c.log.Error("Creating session failed: %s", err)
		return err
	}

	c.log.Info("Connected to %s", target.RemoteAddr().String())

	term.EnableRaw()
	err = attachSession(newSession, term, c.user.ShellRequests)
	if err != nil {

		c.log.Error("Client tried to attach session and failed: %s", err)
		return err
	}

	return fmt.Errorf("Session has terminated.") // Not really an error. But we can get the terminal to print out stuff

}

func (c *connect) Expect(line terminal.ParsedLine) []string {
	if len(line.Arguments) <= 1 {
		return []string{autocomplete.RemoteId}
	}
	return nil
}

func (c *connect) Help(explain bool) string {
	if explain {
		return "Start shell on remote controllable host."
	}

	return terminal.MakeHelpText(
		"connect "+autocomplete.RemoteId,
		"\t--shell\tSet the shell (or program) to start on connection, this also takes an http, https or rssh url that be downloaded to disk and executed",
	)
}

func Connect(
	user *internal.User,
	log logger.Logger) *connect {
	return &connect{
		user: user,
		log:  log,
	}
}

func createSession(sshConn ssh.Conn, ptyReq internal.PtyReq, shell string) (sc ssh.Channel, err error) {

	splice, newrequests, err := sshConn.OpenChannel("session", nil)
	if err != nil {
		return sc, fmt.Errorf("Unable to start remote session on host %s (%s) : %s", sshConn.RemoteAddr(), sshConn.ClientVersion(), err)
	}

	//Send pty request, pty has been continuously updated with window-change sizes
	_, err = splice.SendRequest("pty-req", true, ssh.Marshal(ptyReq))
	if err != nil {
		return sc, fmt.Errorf("Unable to send PTY request: %s", err)
	}

	_, err = splice.SendRequest("shell", true, ssh.Marshal(internal.ShellStruct{Cmd: shell}))
	if err != nil {
		return sc, fmt.Errorf("Unable to start shell: %s", err)
	}

	go ssh.DiscardRequests(newrequests)

	return splice, nil
}

func attachSession(newSession ssh.Channel, currentClientSession io.ReadWriter, currentClientRequests <-chan *ssh.Request) error {

	finished := make(chan bool)

	close := func() {
		newSession.Close()
		finished <- true // Stop the request passer on IO error
	}

	//Setup the pipes for stdin/stdout over the connections

	//Start copying output before we start copying user input, so we can get the responses to the rc files lines
	var once sync.Once
	defer once.Do(close)

	go func() {
		//dst <- src
		io.Copy(newSession, currentClientSession)
		once.Do(close)

	}()

	//newSession being the remote host being controlled
	go func() {
		io.Copy(currentClientSession, newSession) // Potentially be more verbose about errors here
		once.Do(close)                            // Only close the newSession connection once

	}()

RequestsProxyPasser:
	for {
		select {
		case r := <-currentClientRequests:
			response, err := internal.SendRequest(*r, newSession)
			if err != nil {
				break RequestsProxyPasser
			}

			if r.WantReply {
				r.Reply(response, nil)
			}
		case <-finished:
			break RequestsProxyPasser
		}

	}

	return nil
}
