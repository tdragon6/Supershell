//go:build !linux
package storage

import (
	"io"
)

func Store(filename string, r io.ReadCloser) (string, error) {
	return StoreDisk(filename, r)
}
