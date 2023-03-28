package server

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/internal/server/clients"
	"github.com/NHAS/reverse_ssh/internal/server/handlers"
	"github.com/NHAS/reverse_ssh/internal/server/observers"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

type Options struct {
	AllowList []*net.IPNet
	DenyList  []*net.IPNet
	Comment   string
}

func readPubKeys(path string) (m map[string]Options, err error) {
	authorizedKeysBytes, err := ioutil.ReadFile(path)
	if err != nil {
		return m, fmt.Errorf("failed to load file %s, err: %v", path, err)
	}

	keys := bytes.Split(authorizedKeysBytes, []byte("\n"))
	m = map[string]Options{}

	for i, key := range keys {
		key = bytes.TrimSpace(key)
		if len(key) == 0 {
			continue
		}

		pubKey, comment, options, _, err := ssh.ParseAuthorizedKey(key)
		if err != nil {
			return m, fmt.Errorf("unable to parse public key. %s line %d. Reason: %s", path, i+1, err)
		}

		var opts Options
		opts.Comment = comment

		for _, o := range options {
			parts := strings.Split(o, "=")
			if len(parts) == 2 && parts[0] == "from" {
				list := strings.Trim(parts[1], "\"")

				directives := strings.Split(list, ",")
				for _, directive := range directives {
					if len(directive) > 0 {
						switch directive[0] {
						case '!':
							directive = directive[1:]
							newDenys, err := ParseDirective(directive)
							if err != nil {
								log.Println("Unable to add !", directive, " to denylist: ", err)
								continue
							}
							opts.DenyList = append(opts.DenyList, newDenys...)
						default:
							newAllowOnlys, err := ParseDirective(directive)
							if err != nil {
								log.Println("Unable to add ", directive, " to allowlist: ", err)
								continue
							}

							opts.AllowList = append(opts.AllowList, newAllowOnlys...)

						}
					}
				}
			}
		}

		m[string(ssh.MarshalAuthorizedKey(pubKey))] = opts
	}

	return
}

func ParseDirective(address string) (cidr []*net.IPNet, err error) {
	if len(address) > 0 && address[0] == '*' {
		_, all, _ := net.ParseCIDR("0.0.0.0/0")
		_, allv6, _ := net.ParseCIDR("::/0")
		cidr = append(cidr, all, allv6)
		return
	}

	_, mask, err := net.ParseCIDR(address)
	if err == nil {
		cidr = append(cidr, mask)
		return
	}

	ip := net.ParseIP(address)
	if ip == nil {
		var newcidr net.IPNet
		newcidr.IP = ip
		newcidr.Mask = net.CIDRMask(32, 32)

		if ip.To4() == nil {
			newcidr.Mask = net.CIDRMask(128, 128)
		}

		cidr = append(cidr, &newcidr)
		return
	}

	addresses, err := net.LookupIP(address)
	if err != nil {
		return nil, err
	}

	for _, address := range addresses {
		var newcidr net.IPNet
		newcidr.IP = address
		newcidr.Mask = net.CIDRMask(32, 32)

		if address.To4() == nil {
			newcidr.Mask = net.CIDRMask(128, 128)
		}

		cidr = append(cidr, &newcidr)
	}

	if len(addresses) == 0 {
		return nil, errors.New("Unable to find domains for " + address)
	}

	return
}

func StartSSHServer(sshListener net.Listener, privateKey ssh.Signer, insecure bool, dataDir string, timeout int) {
	//Taken from the server example, authorized keys are required for controllers
	authorizedKeysPath := filepath.Join(dataDir, "authorized_keys")
	authorizedControlleeKeysPath := filepath.Join(dataDir, "authorized_controllee_keys")

	log.Printf("Loading authorized keys from: %s\n", authorizedKeysPath)
	authorizedControllers, err := readPubKeys(authorizedKeysPath)
	if err != nil {
		log.Fatal(err)
	}

	if _, err := os.Stat("downloads"); err != nil && os.IsNotExist(err) {
		os.Mkdir("downloads", 0700)
		log.Println("Created downloads directory")
	}

	clients, err := readPubKeys(authorizedControlleeKeysPath)
	if err != nil {
		if !insecure {
			log.Fatal(err)
		} else {
			log.Println(err)
		}
	}

	for key := range clients {
		if _, ok := authorizedControllers[key]; ok {
			log.Fatalf("[ERROR] Key %s is present in both authorized_controllee_keys and authorized_keys. It should only be in one.", strings.TrimSpace(key))
		}
	}

	// In the latest version of crypto/ssh (after Go 1.3), the SSH server type has been removed
	// in favour of an SSH connection type. A ssh.ServerConn is created by passing an existing
	// net.Conn and a ssh.ServerConfig to ssh.NewServerConn, in effect, upgrading the net.Conn
	// into an ssh.ServerConn
	config := &ssh.ServerConfig{
		ServerVersion: "SSH-2.0-OpenSSH_7.4",
		PublicKeyCallback: func(conn ssh.ConnMetadata, key ssh.PublicKey) (*ssh.Permissions, error) {

			authorizedKeysMap, err := readPubKeys(authorizedKeysPath)
			if err != nil {
				log.Println("Reloading authorized_keys failed: ", err)
			}

			authorizedControllees, err := readPubKeys(authorizedControlleeKeysPath)
			if err != nil {
				log.Println("Reloading authorized_controllee_keys failed: ", err)
			}

			remoteIp := getIP(conn.RemoteAddr().String())

			if remoteIp == nil {
				return nil, fmt.Errorf("not authorized %q, could not parse IP address %s", conn.User(), remoteIp)
			}

			//If insecure mode, then any unknown client will be connected as a controllable client.
			//The server effectively ignores channel requests from controllable clients.

			if opt, ok := authorizedKeysMap[string(ssh.MarshalAuthorizedKey(key))]; ok {

				for _, deny := range opt.DenyList {
					if deny.Contains(remoteIp) {
						return nil, fmt.Errorf("not authorized %q (deny list)", conn.User())
					}
				}

				safe := len(opt.AllowList) == 0
				for _, allow := range opt.AllowList {
					if allow.Contains(remoteIp) {
						safe = true
						break
					}
				}

				if !safe {
					return nil, fmt.Errorf("not authorized %q (not on allow list)", conn.User())
				}

				return &ssh.Permissions{
					// Record the public key used for authentication.
					Extensions: map[string]string{
						"comment":   opt.Comment,
						"pubkey-fp": internal.FingerprintSHA1Hex(key),
						"type":      "user",
					},
				}, nil

			}

			if opt, ok := authorizedControllees[string(ssh.MarshalAuthorizedKey(key))]; insecure || ok {

				return &ssh.Permissions{
					// Record the public key used for authentication.
					Extensions: map[string]string{
						"comment":   opt.Comment,
						"pubkey-fp": internal.FingerprintSHA1Hex(key),
						"type":      "client",
					},
				}, nil
			}

			return nil, fmt.Errorf("not authorized %q, potentially you might want to enabled -insecure mode", conn.User())
		},
	}

	config.AddHostKey(privateKey)

	// Accept all connections

	for {
		tcpConn, err := sshListener.Accept()
		if err != nil {
			log.Printf("Failed to accept incoming connection (%s)", err)
			continue
		}

		go acceptConn(tcpConn, config, timeout, dataDir)
	}
}

func getIP(ip string) net.IP {
	for i := len(ip) - 1; i > 0; i-- {
		if ip[i] == ':' {
			return net.ParseIP(strings.Trim(strings.Trim(ip[:i], "]"), "["))
		}
	}

	return nil
}

func acceptConn(c net.Conn, config *ssh.ServerConfig, timeout int, dataDir string) {

	//Initially set the timeout high, so people who type in their ssh key password can actually use rssh
	realConn := &internal.TimeoutConn{c, time.Duration(timeout) * time.Minute}

	// Before use, a handshake must be performed on the incoming net.Conn.
	sshConn, chans, reqs, err := ssh.NewServerConn(realConn, config)
	if err != nil {
		log.Printf("Failed to handshake (%s)", err.Error())
		return
	}

	clientLog := logger.NewLog(sshConn.RemoteAddr().String())

	if timeout > 0 {
		//If we are using timeouts
		//Set the actual timeout much lower to whatever the user specifies it as (defaults to 5 second keepalive, 10 second timeout)
		realConn.Timeout = time.Duration(timeout*2) * time.Second

		go func() {
			for {
				_, _, err = sshConn.SendRequest("keepalive-rssh@golang.org", true, []byte(fmt.Sprintf("%d", timeout)))
				if err != nil {
					clientLog.Info("Failed to send keepalive, assuming client has disconnected")
					sshConn.Close()
					return
				}
				time.Sleep(time.Duration(timeout) * time.Second)
			}
		}()
	}

	switch sshConn.Permissions.Extensions["type"] {
	case "user":
		user, err := internal.CreateUser(sshConn)
		if err != nil {
			sshConn.Close()
			log.Println(err)
			return
		}

		// Since we're handling a shell, local and remote forward, so we expect
		// channel type of "session" or "direct-tcpip", "forwarded-tcpip" respectively.
		go func() {
			err = internal.RegisterChannelCallbacks(user, chans, clientLog, map[string]internal.ChannelHandler{
				"session":      handlers.Session,
				"direct-tcpip": handlers.LocalForward,
			})
			clientLog.Info("User disconnected: %s", err.Error())

			internal.DeleteUser(user)
		}()

		clientLog.Info("New User SSH connection, version %s", sshConn.ClientVersion())

		// Discard all global out-of-band Requests, except for the tcpip-forward
		go ssh.DiscardRequests(reqs)

	case "client":

		id, username, err := clients.Add(sshConn)
		if err != nil {
			clientLog.Error("Unable to add new client %s", err)

			sshConn.Close()
			return
		}

		go func() {
			go ssh.DiscardRequests(reqs)

			err = internal.RegisterChannelCallbacks(nil, chans, clientLog, map[string]internal.ChannelHandler{
				"rssh-download": handlers.Download(dataDir),
			})

			clientLog.Info("SSH client disconnected")
			clients.Remove(id)

			observers.ConnectionState.Notify(observers.ClientState{
				Status:    "disconnected",
				ID:        id,
				IP:        sshConn.RemoteAddr().String(),
				HostName:  username,
				Version:   string(sshConn.ClientVersion()),
				Timestamp: time.Now(),
			})
		}()

		clientLog.Info("New controllable connection with id %s", id)

		observers.ConnectionState.Notify(observers.ClientState{
			Status:    "connected",
			ID:        id,
			IP:        sshConn.RemoteAddr().String(),
			HostName:  username,
			Version:   string(sshConn.ClientVersion()),
			Timestamp: time.Now(),
		})

	default:
		sshConn.Close()
		clientLog.Warning("Client connected but type was unknown, terminating: %s", sshConn.Permissions.Extensions["type"])
	}
}
