package keys

import (
	_ "embed"
	"log"

	"github.com/NHAS/reverse_ssh/internal"
	"golang.org/x/crypto/ssh"
)

//go:embed private_key
var privateKey []byte

func GetPrivateKey() (ssh.Signer, error) {

	sshPriv, err := ssh.ParsePrivateKey(privateKey)
	if err != nil {
		log.Println("Unable to load embedded private key: ", err)
		bs, err := internal.GeneratePrivateKey()
		if err != nil {
			return nil, err
		}

		sshPriv, err = ssh.ParsePrivateKey(bs)
		if err != nil {
			return nil, err
		}
	}

	return sshPriv, nil
}
