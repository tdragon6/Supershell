package internal

import (
	"crypto/ed25519"
	"crypto/rand"
	"crypto/sha1"
	"crypto/sha256"
	"crypto/x509"
	"encoding/binary"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"net"
	"time"

	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

var Version string

type ShellStruct struct {
	Cmd string
}

type RemoteForwardRequest struct {
	BindAddr string
	BindPort uint32
}

type ChannelOpenDirectMsg struct {
	Raddr string
	Rport uint32
	Laddr string
	Lport uint32
}

func GeneratePrivateKey() ([]byte, error) {
	_, priv, err := ed25519.GenerateKey(rand.Reader)
	if err != nil {
		return nil, err
	}

	// Convert a generated ed25519 key into a PEM block so that the ssh library can ingest it, bit round about tbh
	bytes, err := x509.MarshalPKCS8PrivateKey(priv)
	if err != nil {
		return nil, err
	}

	privatePem := pem.EncodeToMemory(
		&pem.Block{
			Type:  "PRIVATE KEY",
			Bytes: bytes,
		},
	)

	return privatePem, nil
}

func FingerprintSHA1Hex(pubKey ssh.PublicKey) string {
	shasum := sha1.Sum(pubKey.Marshal())
	fingerPrint := hex.EncodeToString(shasum[:])
	return fingerPrint
}

func FingerprintSHA256Hex(pubKey ssh.PublicKey) string {
	shasum := sha256.Sum256(pubKey.Marshal())
	fingerPrint := hex.EncodeToString(shasum[:])
	return fingerPrint
}

func SendRequest(req ssh.Request, sshChan ssh.Channel) (bool, error) {
	return sshChan.SendRequest(req.Type, req.WantReply, req.Payload)
}

type PtyReq struct {
	Term          string
	Columns, Rows uint32
	Width, Height uint32
	Modes         string
}

type ClientInfo struct {
	Username string
	Hostname string
	GoArch   string
	GoOS     string
}

// =======================

func ParsePtyReq(req []byte) (out PtyReq, err error) {

	err = ssh.Unmarshal(req, &out)
	return out, err
}

// ParseDims extracts terminal dimensions (width x height) from the provided buffer.
func ParseDims(b []byte) (uint32, uint32) {
	w := binary.BigEndian.Uint32(b)
	h := binary.BigEndian.Uint32(b[4:])
	return w, h
}

// ======================

type ChannelHandler func(user *User, newChannel ssh.NewChannel, log logger.Logger)

func RegisterChannelCallbacks(user *User, chans <-chan ssh.NewChannel, log logger.Logger, handlers map[string]ChannelHandler) error {
	// Service the incoming Channel channel in go routine
	for newChannel := range chans {
		t := newChannel.ChannelType()
		log.Info("Handling channel: %s", t)
		if callBack, ok := handlers[t]; ok {
			go callBack(user, newChannel, log)
			continue
		}

		newChannel.Reject(ssh.UnknownChannelType, fmt.Sprintf("unsupported channel type: %s", t))
		log.Warning("Sent an invalid channel type %q", t)
	}

	return fmt.Errorf("connection terminated")
}

func RandomString(length int) (string, error) {
	randomData := make([]byte, length)
	_, err := rand.Read(randomData)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(randomData), nil
}

type TimeoutConn struct {
	net.Conn
	Timeout time.Duration
}

func (c *TimeoutConn) Read(b []byte) (int, error) {

	if c.Timeout != 0 {
		err := c.Conn.SetDeadline(time.Now().Add(c.Timeout))
		if err != nil {
			return 0, err
		}
	}
	return c.Conn.Read(b)
}

func (c *TimeoutConn) Write(b []byte) (int, error) {
	if c.Timeout != 0 {
		err := c.Conn.SetDeadline(time.Now().Add(c.Timeout))
		if err != nil {
			return 0, err
		}
	}
	return c.Conn.Write(b)
}
