package handlers

import (
	"io"
	"os"
	"path"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func Download(dataDir string) func(user *internal.User, newChannel ssh.NewChannel, log logger.Logger) {
	return func(user *internal.User, newChannel ssh.NewChannel, log logger.Logger) {
		downloadPath := path.Join("/", string(newChannel.ExtraData()))
		//Has to be done in two steps, doing Join("./downloads/", path) leads to path traversal (thanks go)
		downloadPath = path.Join(dataDir, "downloads", downloadPath)

		if stats, err := os.Stat(downloadPath); err != nil && (os.IsNotExist(err) || !stats.IsDir()) {
			log.Warning("remote client requested non-existant path: '%s'", downloadPath)
			newChannel.Reject(ssh.Prohibited, "file not found")
			return
		}

		log.Info("client downloading %s", downloadPath)

		f, err := os.Open(downloadPath)
		if err != nil {
			log.Warning("unable to open requested path: '%s': %s", downloadPath, err)

			newChannel.Reject(ssh.Prohibited, "cannot open file")
			return
		}
		defer f.Close()

		c, r, err := newChannel.Accept()
		if err != nil {
			return
		}
		defer c.Close()
		go ssh.DiscardRequests(r)

		_, err = io.Copy(c, f)
		if err != nil {
			log.Warning("failed to copy to remote client: %s", err)
			return
		}
	}
}
