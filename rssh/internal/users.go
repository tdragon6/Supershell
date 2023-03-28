package internal

import (
	"errors"
	"fmt"
	"sort"
	"sync"

	"golang.org/x/crypto/ssh"
)

var ErrNilServerConnection = errors.New("The server connection was nil for the client")

var lUsers sync.RWMutex
var users map[string]bool = make(map[string]bool)

type User struct {
	// This is the users connection to the server itself, creates new channels and whatnot. NOT to get io.Copy'd
	ServerConnection ssh.Conn

	Pty *PtyReq

	ShellRequests <-chan *ssh.Request

	// Remote forwards sent by user
	SupportedRemoteForwards map[RemoteForwardRequest]bool //(set)

	// So we can capture details about who is currently using the rssh server
	ConnectionDetails string
}

func CreateUser(ServerConnection ssh.Conn) (us *User, err error) {
	if ServerConnection == nil {
		err = ErrNilServerConnection
		return
	}

	us = &User{
		ServerConnection:        ServerConnection,
		SupportedRemoteForwards: make(map[RemoteForwardRequest]bool),
		ConnectionDetails:       fmt.Sprintf("%s@%s", ServerConnection.User(), ServerConnection.RemoteAddr().String()),
	}

	lUsers.Lock()
	defer lUsers.Unlock()

	users[us.ConnectionDetails] = true

	return
}

func ListUsers() (userList []string) {
	lUsers.RLock()
	defer lUsers.RUnlock()

	for user := range users {
		userList = append(userList, user)
	}

	sort.Strings(userList)
	return
}

func DeleteUser(us *User) {
	if us != nil {

		lUsers.Lock()
		delete(users, us.ConnectionDetails)
		lUsers.Unlock()

		if us.ServerConnection != nil {
			defer us.ServerConnection.Close()
		}
	}
}
