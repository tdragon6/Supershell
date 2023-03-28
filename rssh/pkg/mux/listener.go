package mux

import (
	"errors"
	"net"
)

type multiplexerListener struct {
	addr        net.Addr
	connections chan net.Conn
	closed      bool
	protocol    string
}

func newMultiplexerListener(addr net.Addr, protocol string) *multiplexerListener {
	return &multiplexerListener{addr: addr, connections: make(chan net.Conn), protocol: protocol}
}

func (ml *multiplexerListener) Accept() (net.Conn, error) {
	if ml.closed {
		return nil, errors.New("Accept on closed listener")
	}
	return <-ml.connections, nil
}

// Close closes the listener.
// Any blocked Accept operations will be unblocked and return errors.
func (ml *multiplexerListener) Close() error {
	if !ml.closed {
		ml.closed = true
		close(ml.connections)
	}

	return nil
}

// Addr returns the listener's network address.
func (ml *multiplexerListener) Addr() net.Addr {
	if ml.closed {
		return nil
	}
	return ml.addr
}
