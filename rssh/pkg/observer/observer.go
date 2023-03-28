package observer

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
)

func random(length int) (string, error) {
	randomData := make([]byte, length)
	_, err := rand.Read(randomData)
	if err != nil {
		return "", err
	}

	return hex.EncodeToString(randomData), nil
}

type observer struct {
	sync.RWMutex
	clients  map[string]Target
	typeName string
}

type Target func(message Message)

func (o *observer) Register(t Target) (id string) {
	o.Lock()
	defer o.Unlock()

	id, _ = random(10)

	o.clients[id] = t

	return id
}

func (o *observer) Deregister(id string) {
	o.Lock()
	defer o.Unlock()

	delete(o.clients, id)
}

func (o *observer) Notify(message Message) {
	o.RLock()
	defer o.RUnlock()

	for i := range o.clients {
		go o.clients[i](message)
	}
}

func New(msgType Message) observer {

	return observer{
		clients:  make(map[string]Target),
		typeName: fmt.Sprintf("%T", msgType),
	}
}

type Message interface {
	Json() ([]byte, error)
	Summary() string
}
