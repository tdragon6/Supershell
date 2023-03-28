package clients

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
	"sync"

	"github.com/NHAS/reverse_ssh/internal"
	"github.com/NHAS/reverse_ssh/pkg/trie"
	"golang.org/x/crypto/ssh"
)

var (
	lock                 sync.RWMutex
	clients              = map[string]*ssh.ServerConn{}
	uniqueIdToAllAliases = map[string][]string{}
	aliases              = map[string]map[string]bool{}

	Autocomplete = trie.NewTrie()

	usernameRegex = regexp.MustCompile(`[^\w-]`)
)

func NormaliseHostname(hostname string) string {
	hostname = strings.ToLower(hostname)

	hostname = usernameRegex.ReplaceAllString(hostname, ".")

	return hostname
}

func Add(conn *ssh.ServerConn) (string, string, error) {
	lock.Lock()
	defer lock.Unlock()

	idString, err := internal.RandomString(20)
	if err != nil {
		return "", "", err
	}

	username := NormaliseHostname(conn.User())

	addAlias(idString, username)
	addAlias(idString, conn.RemoteAddr().String())
	addAlias(idString, conn.Permissions.Extensions["pubkey-fp"])
	if conn.Permissions.Extensions["comment"] != "" {
		addAlias(idString, conn.Permissions.Extensions["comment"])
	}
	clients[idString] = conn

	Autocomplete.Add(idString)
	for _, v := range uniqueIdToAllAliases[idString] {
		Autocomplete.Add(v)
	}

	return idString, username, nil

}

func addAlias(uniqueId, newAlias string) {
	if _, ok := aliases[newAlias]; !ok {
		aliases[newAlias] = make(map[string]bool)
	}

	uniqueIdToAllAliases[uniqueId] = append(uniqueIdToAllAliases[uniqueId], newAlias)
	aliases[newAlias][uniqueId] = true
}

func Search(filter string) (out map[string]*ssh.ServerConn, err error) {

	filter = filter + "*"
	_, err = filepath.Match(filter, "")
	if err != nil {
		return nil, fmt.Errorf("filter is not well formed")
	}

	out = make(map[string]*ssh.ServerConn)

	lock.RLock()
	defer lock.RUnlock()

outer:
	for id, conn := range clients {
		if filter == "" {
			out[id] = conn
			continue
		}

		match, _ := filepath.Match(filter, id)
		if match {
			out[id] = conn
			continue
		}

		for _, alias := range uniqueIdToAllAliases[id] {
			match, _ = filepath.Match(filter, alias)
			if match {
				out[id] = conn
				continue outer
			}
		}

		match, _ = filepath.Match(filter, conn.RemoteAddr().String())
		if match {
			out[id] = conn
			continue
		}

	}

	return
}

func Get(identifier string) (ssh.Conn, error) {
	lock.RLock()
	defer lock.RUnlock()

	if m, ok := clients[identifier]; ok {
		return m, nil
	}

	if m, ok := aliases[identifier]; ok {
		if len(m) == 1 {
			for k := range m {
				return clients[k], nil
			}
		}

		matches := 0
		matchingHosts := ""
		for k := range m {
			matches++
			client := clients[k]
			matchingHosts += fmt.Sprintf("%s (%s %s)\n", k, client.User(), client.RemoteAddr().String())
		}

		if len(matchingHosts) > 0 {
			matchingHosts = matchingHosts[:len(matchingHosts)-1]
		}
		return nil, fmt.Errorf("%d connections match alias '%s'\n%s", matches, identifier, matchingHosts)

	}

	return nil, fmt.Errorf("%s not found", identifier)
}

func Remove(uniqueId string) {
	lock.Lock()
	defer lock.Unlock()

	if _, ok := clients[uniqueId]; !ok {
		//If this is already removed then we dont need to remove it again.
		return
	}

	Autocomplete.Remove(uniqueId)
	delete(clients, uniqueId)

	if currentAliases, ok := uniqueIdToAllAliases[uniqueId]; ok {

		for _, alias := range currentAliases {
			if len(aliases[alias]) <= 1 {
				Autocomplete.Remove(alias)
				delete(aliases, alias)
			}

			delete(aliases[alias], uniqueId)
		}
		delete(uniqueIdToAllAliases, uniqueId)
	}

}
