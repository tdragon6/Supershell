package handlers

import (
	"fmt"
	"io"
	"net"
	"time"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func LocalForward(_ *internal.User, newChannel ssh.NewChannel, l logger.Logger) {
	a := newChannel.ExtraData()

	var drtMsg internal.ChannelOpenDirectMsg
	err := ssh.Unmarshal(a, &drtMsg)
	if err != nil {
		l.Warning("Unable to unmarshal proxy %s", err)
		newChannel.Reject(ssh.ResourceShortage, "Unable to unmarshal proxy")
		return
	}

	d := net.Dialer{Timeout: 5 * time.Second}
	dest := fmt.Sprintf("%s:%d", drtMsg.Raddr, drtMsg.Rport)
	tcpConn, err := d.Dial("tcp", dest)
	if err != nil {
		l.Warning("Unable to dial destination: %s", err)
		newChannel.Reject(ssh.ConnectionFailed, "Unable to connect to "+dest)
		return
	}
	defer tcpConn.Close()

	d.Timeout = 0

	connection, requests, err := newChannel.Accept()
	if err != nil {
		newChannel.Reject(ssh.ResourceShortage, dest)
		l.Warning("Unable to accept new channel %s", err)
		return
	}
	defer connection.Close()

	go ssh.DiscardRequests(requests)

	go func() {
		defer tcpConn.Close()
		defer connection.Close()

		io.Copy(connection, tcpConn)

	}()

	io.Copy(tcpConn, connection)

}
