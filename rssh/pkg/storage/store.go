package storage

import (
	"io"
	"os"
)

func StoreDisk(path string, r io.ReadCloser) (string, error) {
	out, err := os.Create(path)
	if err != nil {
		return "", err
	}
	defer out.Close()

	err = os.Chmod(path, 0700)
	if err != nil {
		return "", err
	}

	_, err = io.Copy(out, r)
	if err != nil {
		return "", err
	}

	return path, err
}
