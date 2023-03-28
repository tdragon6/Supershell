package handlers

import (
	"encoding/binary"
	"fmt"
	"io"
	"net"
	"strconv"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/server/clients"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func LocalForward(_ *internal.User, newChannel ssh.NewChannel, log logger.Logger) {
	proxyTarget := newChannel.ExtraData()

	var drtMsg internal.ChannelOpenDirectMsg
	err := ssh.Unmarshal(proxyTarget, &drtMsg)
	if err != nil {
		log.Warning("Unable to unmarshal proxy destination: %s", err)
		return
	}

	addr := net.ParseIP(drtMsg.Raddr)
	if addr != nil {
		//SSH takes numbers and makes them into IP addresses, since we've introduced Search() instead of Get() for clients
		//People will now enter partial ids, such as 0, 01, etc, and when this gets marshalled into an ip address we have to change it back :(
		value := int64(binary.BigEndian.Uint32(addr))
		if len(addr) == 16 {
			value = int64(binary.BigEndian.Uint32(addr[12:16]))
		}

		drtMsg.Raddr = strconv.FormatInt(value, 10)
	}

	foundClients, err := clients.Search(drtMsg.Raddr)
	if err != nil {
		newChannel.Reject(ssh.Prohibited, err.Error())
		return
	}

	if len(foundClients) == 0 {
		newChannel.Reject(ssh.ConnectionFailed, fmt.Sprintf("\n\nNo clients matched '%s'\n", drtMsg.Raddr))
		return
	}

	if len(foundClients) > 1 {
		newChannel.Reject(ssh.ConnectionFailed, fmt.Sprintf("\n\n'%s' matches multiple clients please choose a more specific identifier\n", drtMsg.Raddr))
		return
	}

	var target ssh.Conn
	//Horrible way of getting the first element of a map in go
	for k := range foundClients {
		target = foundClients[k]
		break
	}

	targetConnection, targetRequests, err := target.OpenChannel("jump", nil)
	if err != nil {
		newChannel.Reject(ssh.ConnectionFailed, err.Error())
		return
	}
	defer targetConnection.Close()
	go ssh.DiscardRequests(targetRequests)

	connection, requests, err := newChannel.Accept()
	if err != nil {
		newChannel.Reject(ssh.ConnectionFailed, err.Error())
		return
	}
	defer connection.Close()
	go ssh.DiscardRequests(requests)

	go func() {
		io.Copy(connection, targetConnection)
		connection.Close()
	}()
	io.Copy(targetConnection, connection)
}
