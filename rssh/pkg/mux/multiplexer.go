package mux

import (
	"bytes"
	"context"
	"errors"
	"log"
	"net"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type MultiplexerConfig struct {
	SSH          bool
	HTTP         bool
	TcpKeepAlive int
}

type Multiplexer struct {
	sync.RWMutex
	protocols      map[string]*multiplexerListener
	done           bool
	listeners      map[string]net.Listener
	newConnections chan net.Conn

	config MultiplexerConfig
}

func (m *Multiplexer) StartListener(network, address string) error {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.listeners[address]; ok {
		return errors.New("Address " + address + " already listening")
	}

	d := time.Duration(time.Duration(m.config.TcpKeepAlive) * time.Second)
	if m.config.TcpKeepAlive == 0 {
		d = time.Duration(-1)
	}

	lc := net.ListenConfig{
		KeepAlive: d,
	}

	listener, err := lc.Listen(context.Background(), network, address)
	if err != nil {
		return err
	}

	m.listeners[address] = listener

	go func(listen net.Listener) {
		for {
			conn, err := listen.Accept()
			if err != nil {
				if strings.Contains(err.Error(), "use of closed network connection") {
					m.Lock()

					delete(m.listeners, address)

					m.Unlock()
					return
				}
				continue

			}

			go func() {
				select {
				case m.newConnections <- conn:
				case <-time.After(2 * time.Second):
					log.Println("Accepting new connection timed out")
					conn.Close()
				}
			}()
		}

	}(listener)

	return nil
}

func (m *Multiplexer) StopListener(address string) error {
	m.Lock()
	defer m.Unlock()

	listener, ok := m.listeners[address]
	if !ok {
		return errors.New("Address " + address + " not listening")
	}

	return listener.Close()
}

func (m *Multiplexer) GetListeners() []string {
	m.RLock()
	defer m.RUnlock()

	listeners := []string{}
	for l := range m.listeners {
		listeners = append(listeners, l)
	}

	sort.Strings(listeners)

	return listeners
}

func ListenWithConfig(network, address string, _c MultiplexerConfig) (*Multiplexer, error) {

	var m Multiplexer

	m.newConnections = make(chan net.Conn)
	m.listeners = make(map[string]net.Listener)
	m.protocols = map[string]*multiplexerListener{}
	m.config = _c

	err := m.StartListener(network, address)
	if err != nil {
		return nil, err
	}

	if m.config.SSH {
		m.protocols["ssh"] = newMultiplexerListener(m.listeners[address].Addr(), "ssh")
	}

	if m.config.HTTP {
		m.protocols["http"] = newMultiplexerListener(m.listeners[address].Addr(), "http")
	}

	var waitingConnections int32
	go func() {
		for conn := range m.newConnections {

			if atomic.LoadInt32(&waitingConnections) > 1000 {
				conn.Close()
				continue
			}

			//Atomic as other threads may be writing and reading while we do this
			atomic.AddInt32(&waitingConnections, 1)
			go func(conn net.Conn) {

				defer atomic.AddInt32(&waitingConnections, -1)

				conn.SetDeadline(time.Now().Add(2 * time.Second))
				l, prefix, err := m.determineProtocol(conn)
				if err != nil {
					conn.Close()
					log.Println("Multiplexing failed: ", err)
					return
				}

				conn.SetDeadline(time.Time{})

				select {
				//Allow whatever we're multiplexing to apply backpressure if it cant accept things
				case l.connections <- &bufferedConn{conn: conn, prefix: prefix}:
				case <-time.After(2 * time.Second):

					log.Println(l.protocol, "Failed to accept new connection within 2 seconds, closing connection (may indicate high resource usage)")
					conn.Close()
				}

			}(conn)

		}
	}()

	return &m, nil
}

func Listen(network, address string) (*Multiplexer, error) {
	c := MultiplexerConfig{
		SSH:          true,
		HTTP:         true,
		TcpKeepAlive: 7200, // Linux default timeout is 2 hours
	}

	return ListenWithConfig(network, address, c)
}

func (m *Multiplexer) Close() {
	m.done = true

	for address := range m.listeners {
		m.StopListener(address)
	}

	for _, v := range m.protocols {
		v.Close()
	}

	close(m.newConnections)

}

func isHttp(b []byte) bool {

	validMethods := [][]byte{
		[]byte("GET"), []byte("HEAD"), []byte("POST"),
		[]byte("PUT"), []byte("DELETE"), []byte("CONNECT"),
		[]byte("OPTIONS"), []byte("TRACE"), []byte("PATCH"),
	}

	for _, vm := range validMethods {
		if bytes.HasPrefix(b, vm) {
			return true
		}
	}

	return false
}

func (m *Multiplexer) determineProtocol(c net.Conn) (*multiplexerListener, []byte, error) {
	b := make([]byte, 3)
	_, err := c.Read(b)
	if err != nil {
		return nil, nil, err
	}

	proto := ""
	if bytes.HasPrefix(b, []byte{'S', 'S', 'H'}) {
		proto = "ssh"
	} else if isHttp(b) {
		proto = "http"
	}

	l, ok := m.protocols[proto]
	if !ok {
		return nil, nil, errors.New("Unknown protocol")
	}

	return l, b, nil
}

func (m *Multiplexer) getProtoListener(proto string) net.Listener {
	ml, ok := m.protocols[proto]
	if !ok {
		panic("Unknown protocol passed: " + proto)
	}

	return ml
}

func (m *Multiplexer) SSH() net.Listener {
	return m.getProtoListener("ssh")
}

func (m *Multiplexer) HTTP() net.Listener {
	return m.getProtoListener("http")
}
