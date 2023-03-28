package handlers

import (
	"fmt"
	"io"
	"net"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func JumpHandler(sshPriv ssh.Signer, serverConn ssh.Conn) internal.ChannelHandler {

	return func(_ *internal.User, newChannel ssh.NewChannel, log logger.Logger) {
		connection, requests, err := newChannel.Accept()
		if err != nil {
			newChannel.Reject(ssh.ResourceShortage, err.Error())
			return
		}
		go ssh.DiscardRequests(requests)
		defer connection.Close()

		config := &ssh.ServerConfig{
			PublicKeyCallback: func(conn ssh.ConnMetadata, key ssh.PublicKey) (*ssh.Permissions, error) {
				return &ssh.Permissions{
					Extensions: map[string]string{
						"pubkey-fp": internal.FingerprintSHA1Hex(key),
					},
				}, nil
			},
		}
		config.AddHostKey(sshPriv)

		p1, p2 := net.Pipe()
		go io.Copy(connection, p2)
		go func() {
			io.Copy(p2, connection)

			p2.Close()
			p1.Close()
		}()

		conn, chans, reqs, err := ssh.NewServerConn(p1, config)
		if err != nil {
			log.Error("%s", err.Error())
			return
		}
		defer conn.Close()

		clientLog := logger.NewLog(serverConn.RemoteAddr().String())
		clientLog.Info("New SSH connection, version %s", conn.ClientVersion())

		user, err := internal.CreateUser(serverConn)
		if err != nil {
			log.Error("Unable to add user %s\n", err)
			return
		}

		go func(in <-chan *ssh.Request) {
			for r := range in {
				switch r.Type {
				case "tcpip-forward":
					go StartRemoteForward(user, r, conn)
				case "cancel-tcpip-forward":
					var rf internal.RemoteForwardRequest

					err := ssh.Unmarshal(r.Payload, &rf)
					if err != nil {
						r.Reply(false, []byte(fmt.Sprintf("Unable to unmarshal remote forward request in order to stop it: %s", err.Error())))
						return
					}

					go func() {
						err := StopRemoteForward(rf)
						if err != nil {
							r.Reply(false, []byte(err.Error()))
							return
						}

						r.Reply(true, nil)
					}()
				default:
					//Ignore any unspecified global requests
					r.Reply(false, nil)
				}
			}
		}(reqs)

		err = internal.RegisterChannelCallbacks(user, chans, clientLog, map[string]internal.ChannelHandler{
			"session":      Session,
			"direct-tcpip": LocalForward,
		})

		if err != nil {
			log.Error("Channel call back error: %s", err)
		}

		for rf := range user.SupportedRemoteForwards {
			go StopRemoteForward(rf)
		}

	}
}
