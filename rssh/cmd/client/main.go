package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/NHAS/reverse_ssh/internal/terminal"
)

var (
	destination string
	fingerprint string
	ignoreInput string
)

func printHelp() {
	fmt.Println("usage: ", filepath.Base(os.Args[0]), "[--foreground] [--fingerprint] destination")
	fmt.Println("\t\t--foreground\tCauses the client to run without forking to background")
	fmt.Println("\t\t--fingerprint\tServer public key SHA256 hex fingerprint for auth")
	fmt.Println("\t\t--proxy\tLocation of HTTP connect proxy to use")
}

func main() {

	if len(os.Args) == 0 || ignoreInput == "true" {
		Run(destination, fingerprint, "")
		return
	}

	os.Args[0] = strconv.Quote(os.Args[0])
	var argv = strings.Join(os.Args, " ")

	line := terminal.ParseLine(argv, 0)

	if line.IsSet("h") || line.IsSet("help") {
		printHelp()
		return
	}

	if len(line.Arguments) < 1 && len(destination) == 0 {
		fmt.Println("No destination specified")
		printHelp()
		return
	}

	if len(line.Arguments) > 0 {
		destination = line.Arguments[len(line.Arguments)-1].Value()
	}

	fg := line.IsSet("foreground")

	proxyaddress, _ := line.GetArgString("proxy")

	userSpecifiedFingerprint, err := line.GetArgString("fingerprint")
	if err == nil {
		fingerprint = userSpecifiedFingerprint
	}

	if fg {
		Run(destination, fingerprint, proxyaddress)
		return
	}

	err = Fork(destination, fingerprint, proxyaddress)
	if err != nil {
		Run(destination, fingerprint, proxyaddress)
	}

}
