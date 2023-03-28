package storage

import (
	"fmt"
	"io"

	"github.com/justincormack/go-memfd"
)

func Store(filename string, r io.ReadCloser) (string, error) {

	mfd, err := memfd.Create()
	if err != nil {
		return StoreDisk(filename, r)
	}
	_, err = io.Copy(mfd, r)
	if err != nil {
		return StoreDisk(filename, r)
	}

	return fmt.Sprintf("/proc/self/fd/%d", mfd.Fd()), nil
}
