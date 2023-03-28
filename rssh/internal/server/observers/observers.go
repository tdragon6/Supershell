package observers

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/NHAS/reverse_ssh/pkg/observer"
)

type ClientState struct {
	Status    string
	ID        string
	IP        string
	HostName  string
	Version   string
	Timestamp time.Time
}

func (cs ClientState) Summary() string {
	return fmt.Sprintf("%s (%s) %s %s", cs.HostName, cs.ID, cs.Version, cs.Status)
}

func (cs ClientState) Json() ([]byte, error) {
	return json.Marshal(cs)
}

var ConnectionState = observer.New(ClientState{})
