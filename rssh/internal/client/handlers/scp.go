package handlers

import (
	"bufio"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/NHAS/reverse_ssh/pkg/logger"
	"golang.org/x/crypto/ssh"
)

func scpError(severity int, reason string, connection io.Writer) {
	connection.Write([]byte{byte(severity)})
	connection.Write([]byte(reason + "\n"))
}

func scp(commandParts []string, connection ssh.Channel, log logger.Logger) error {

	//Find what the target file path is, essentially ignore anything that is a flag '-t'
	loc := -1
	mode := ""
	for i := 0; i < len(commandParts); i++ {
		if mode == "" && (commandParts[i] == "-t" || commandParts[i] == "-f") {
			mode = commandParts[i]
			continue
		}

		if len(commandParts[i]) > 0 && commandParts[i][0] != '-' {
			loc = i
			break
		}
	}

	path := strings.Join(commandParts[loc:], " ")

	log.Info("Mode: %s %s\n", mode, path)
	switch mode {
	case "-t":
		err := to(path, connection)
		if err != nil {
			log.Warning("Error copying to: %s\n", err)
			scpError(2, fmt.Sprintf("error: %s", err), connection)
			return err

		}
	case "-f":
		from(path, connection)

	default:
		log.Warning("Unknown mode.")
	}

	return nil

}

func readProtocolControl(connection ssh.Channel) (string, uint32, uint64, string, error) {
	control, err := bufio.NewReader(connection).ReadString('\n')
	if err != nil {
		log.Println(err)
		return "", 0, 0, "", err
	}

	_, err = connection.Write([]byte{0})
	if err != nil {
		return "", 0, 0, "", err
	}

	if len(control) > 0 && control[0] == 'E' {
		return "exit", 0, 0, "", nil
	}

	parts := strings.SplitN(control, " ", 3)
	if len(parts) != 3 {
		return "", 0, 0, "", errors.New("Protocol error: " + control)
	}

	mode, _ := strconv.ParseInt(parts[0][1:], 8, 32)
	size, _ := strconv.ParseInt(parts[1], 10, 64)
	filename := parts[len(parts)-1]
	filename = filename[:len(filename)-1]

	switch parts[0][0] {
	case 'D':
		return "dir", uint32(mode), uint64(size), filename, nil
	case 'C':
		return "file", uint32(mode), uint64(size), filename, nil
	default:
		return "", 0, 0, "", errors.New(fmt.Sprintf("Unknown mode: %s", strings.TrimSpace(control)))
	}
}

func readFile(connection ssh.Channel, path string, mode uint32, size uint64) error {

	f, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE, fs.FileMode(mode))
	if err != nil {

		return err
	}
	defer f.Close()

	b := make([]byte, 1024)
	var nn uint64
	for {

		readsize := (size - nn) % 1024
		if readsize == 0 {
			readsize = 1024
		}

		n, err := connection.Read(b[:readsize])
		if err != nil {
			return err
		}

		nn += uint64(n)

		nf, err := f.Write(b[:n])
		if err != nil {

			return err
		}

		if nf != n {
			return err
		}

		if nn == size {
			break
		}
	}

	status, _ := readAck(connection)
	if status != 0 {
		return errors.New("ACK bad")
	}

	_, err = connection.Write([]byte{0})

	return err
}

func readDirectory(connection ssh.Channel, path string, mode uint32) error {

	err := os.Mkdir(path, os.FileMode(mode))
	if err != nil && !os.IsExist(err) {
		return err
	}

	for {
		t, mode, size, filename, err := readProtocolControl(connection)

		if err != nil {
			return err
		}

		newPath := filepath.Join(path, filename)

		switch t {
		case "dir":
			err = readDirectory(connection, newPath, mode)
			if err != nil {
				return err
			}
		case "file":
			err = readFile(connection, newPath, mode, size)
			if err != nil {
				return err
			}
		case "exit":
			return nil
		}
	}

}

func to(tocreate string, connection ssh.Channel) error {

	_, err := connection.Write([]byte{0})
	if err != nil {
		return err
	}

	t, mode, size, filename, err := readProtocolControl(connection)
	if err != nil {
		return err
	}

	switch t {
	case "dir":
		return readDirectory(connection, tocreate, mode)
	case "file":
		pathinfo, err := os.Stat(tocreate)
		if err != nil && !os.IsNotExist(err) {
			return err
		}

		var path string = tocreate
		if pathinfo != nil && pathinfo.IsDir() {
			path = filepath.Join(tocreate, filename)
		}

		return readFile(connection, path, mode, size)
	default:
		return errors.New("Unknown file type")
	}

}

func from(todownload string, connection ssh.Channel) {
	clientReady, _ := readAck(connection)
	if clientReady != 0 {
		scpError(2, "client didnt acknowledge", connection)
		return
	}

	fileinfo, err := os.Stat(todownload)
	if err != nil {
		scpError(1, err.Error(), connection)
		return
	}

	if fileinfo.Mode().IsRegular() {
		log.Println("Transfering single file")
		err = scpTransferFile(todownload, fileinfo, connection)

	}

	if fileinfo.IsDir() {
		log.Println("Transferring directory")
		err = scpTransferDirectory(todownload, fileinfo, connection)
	}

	if err != nil {
		scpError(1, err.Error(), connection)
	}

	connection.Write([]byte("E\n"))
	success, _ := readAck(connection)
	if success != 0 {
		scpError(2, "failed to ack final write", connection)
		return
	}

	return
}

func scpTransferDirectory(path string, mode fs.FileInfo, connection ssh.Channel) error {
	_, err := connection.Write([]byte(fmt.Sprintf("D%#o 1 %s\n", mode.Mode().Perm(), filepath.Base(path))))
	if err != nil {
		return err
	}

	dir, err := os.Open(path)
	if err != nil {
		return err
	}

	files, err := dir.Readdir(-1)
	dir.Close()
	if err != nil {
		return err
	}

	success, _ := readAck(connection)
	if success != 0 {
		return errors.New("Creating directory failed")
	}

	for _, file := range files {
		if file.IsDir() {
			err := scpTransferDirectory(filepath.Join(path, file.Name()), file, connection)
			if err != nil {
				scpError(1, err.Error(), connection)
			}
			continue
		}

		err := scpTransferFile(filepath.Join(path, file.Name()), file, connection)
		if err != nil {
			scpError(1, err.Error(), connection)
		}
	}

	_, err = connection.Write([]byte("E\n"))

	return err
}

func readAck(conn ssh.Channel) (int, error) {

	buf := make([]byte, 1)
	_, err := conn.Read(buf)
	if err != nil {
		return -1, err
	}

	return int(buf[0]), nil

}

func scpTransferFile(path string, fi fs.FileInfo, connection ssh.Channel) error {

	file, err := os.Open(path)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = fmt.Fprintf(connection, "C%04o %d %s\n", fi.Mode().Perm(), fi.Size(), filepath.Base(path))
	if err != nil {
		return err
	}

	readyToAcceptFile, _ := readAck(connection)
	if readyToAcceptFile != 0 {
		return errors.New("Client unable to receive new file")
	}

	defer func() {
		connection.Write([]byte{0})
		failedToFinish, _ := readAck(connection)
		if failedToFinish != 0 {
			log.Println("Unable to finish up file")
		}
	}()

	buf := make([]byte, 1024)
	for {
		n, err := file.Read(buf)
		if err != nil {
			if err == io.EOF {
				return nil
			}
			return err
		}

		nn, err := connection.Write(buf[:n])
		if nn < n {
			return errors.New("Not able to do full write, connection is bad")
		}

		if err != nil {
			return err
		}

		if n < 1024 {
			return nil
		}
	}
}
